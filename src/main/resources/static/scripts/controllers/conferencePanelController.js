import userService from '../services/userService.js'
import stunTurnService from '../services/stunTurnService.js'
import PeerMessage from '../model/PeerMessage.js'
import PeerMessageCode from '../model/PeerMessageCode.js'
import StunTurnServerConfig from "../model/StunTurnServerConfig.js";
import navigationController from './navigationController.js';

const conferencePanelController = {

    /** @type {HTMLElement} */
    _selectedParticipantPanel: null,
    /** @type {HTMLElement} */
    _participantMiniaturesPanel: null,
    /** @type {HTMLVideoElement} */
    _selectedParticipantVideo: null,
    /** @type {Number} */
    _currentUserId: null,
    /** @type {MediaStream} */
    _localVideoStream: null,
    /** @type {RTCPeerConnection} */
    _peerConnection: null,
    /** @type {StunTurnServerConfig} */
    _stunTurnServerConfig: null,

    async init() {
        this._selectedParticipantPanel = document.getElementById('selected-participant-panel');
        this._participantMiniaturesPanel = document.getElementById('participant-miniatures-panel');
        this._selectedParticipantVideo = /** @type {HTMLVideoElement} */
            document.getElementById('selected-participant-video');

        this._selectedParticipantPanel.style.display = 'none';
        this._participantMiniaturesPanel.style.display = 'none';

        this._showMessage('Please call an user to start a conference call.');

        // Handle hang up event
        const exitConferenceButton = document.getElementById('exit-from-conference');
        exitConferenceButton.addEventListener('click', () => {
            this._exitFromConference();
        });

        // Handle participant miniature selection
        this._participantMiniaturesPanel.addEventListener('click', event => {
            const targetElement = /** @type {HTMLElement} */ event.target;

            const userId = targetElement.getAttribute('data-user-id');
            if (userId) {
                this._selectParticipantMiniature(Number(userId));
            }
        });

        // Load STUN / TURN server configuration
        this._stunTurnServerConfig = await stunTurnService.getServerConfiguration();
    },

    /**
     * @param {Number} callerUserId
     * @param {Number} otherUserId
     * @param {Number} currentUserId
     */
    async onConferenceCallStarted(callerUserId, otherUserId, currentUserId) {
        this._currentUserId = currentUserId;
        const callerUser = await userService.findUserById(callerUserId);
        const otherUser = await userService.findUserById(otherUserId);

        // Display the miniature of each participant
        const participants = [callerUser, otherUser];
        this._participantMiniaturesPanel.innerHTML = participants
            .map(participant => {
                const isMuted = participant.id === this._currentUserId;

                return `<div class="participant-miniature"
                             id="participant-miniature-${participant.id}"
                             data-user-id="${participant.id}">
                    <video class="participant-miniature-video"
                           id="participant-miniature-video-${participant.id}"
                           autoplay="autoplay"
                           ${isMuted ? 'muted="muted"' : ''}
                           data-user-id="${participant.id}"></video>
                    <div class="participant-miniature-name"
                         data-user-id="${participant.id}">${participant.name}</div>
                </div>`;
            })
            .join('\n');

        this._showMessage('');
        this._selectedParticipantPanel.style.display = 'flex';
        this._participantMiniaturesPanel.style.display = 'flex';

        navigationController.navigateToContentPanel('conference-panel');

        // If the current user is the caller, initiate the peer connection
        if (currentUserId === callerUserId) {
            this._initiatePeerConnectionToOtherUser(otherUserId);
        }
    },

    onConferenceCallEnded() {
        if (this._peerConnection) {
            this._peerConnection.close();
        }

        const videoElements = document.getElementsByClassName('participant-miniature-video');
        for (let videoElement of videoElements) {
            if (videoElement.srcObject) {
                videoElement.srcObject.getTracks().forEach(track => track.stop());
            }
        }
        if (this._localVideoStream) {
            this._localVideoStream = null;
        }

        this._selectedParticipantVideo.pause();
        this._selectedParticipantVideo.srcObject = null;

        this._participantMiniaturesPanel.innerHTML = '';
        this._selectedParticipantPanel.style.display = 'none';
        this._participantMiniaturesPanel.style.display = 'none';
        this._showMessage('Conference call ended.');
    },

    /**
     * @param {PeerMessage} peerMessage
     */
    onPeerMessageReceived(peerMessage) {
        switch (peerMessage.code) {
            case PeerMessageCode.OFFER_STREAM:
                this._handleStreamOffer(JSON.parse(peerMessage.jsonPayload), peerMessage.senderUserId);
                break;
            case PeerMessageCode.ANSWER_STREAM:
                this._handleStreamAnswer(JSON.parse(peerMessage.jsonPayload), peerMessage.senderUserId);
                break;
            case PeerMessageCode.ICE_CANDIDATE:
                this._handleReceivedIceCandidate(JSON.parse(peerMessage.jsonPayload), peerMessage.senderUserId);
                break;
        }
    },

    /**
     * @param {String} message
     * @private
     */
    _showMessage(message) {
        const messageElement = document.getElementById('conference-panel-message');

        messageElement.innerText = message;
        messageElement.style.display = message ? 'block' : 'none';
    },

    async _exitFromConference() {
        try {
            await userService.exitFromConferenceCall(this._currentUserId);
        } catch (e) {
            alert(`Error: ${e.message}`);
        }
    },

    /**
     * @param {Number} otherUserId
     * @private
     */
    async _initiatePeerConnectionToOtherUser(otherUserId) {
        // Open the local video stream
        if (!await this._openLocalVideoStream()) {
            this._exitFromConference();
            return;
        }

        this._selectParticipantMiniature(this._currentUserId);

        // Create a WebRTC peer connection
        this._peerConnection = new RTCPeerConnection({
            iceServers: [{
                urls: [this._stunTurnServerConfig.url],
                username: this._stunTurnServerConfig.username,
                credential: this._stunTurnServerConfig.password
            }]
        });

        this._peerConnection.addEventListener('negotiationneeded', () => {
            this._startPeerConnectionNegotiationWithOtherUser(otherUserId);
        });
        this._peerConnection.addEventListener('icecandidate', event => {
            this._sendIceCandidateToOtherUser(event.candidate, otherUserId);
        });
        this._peerConnection.addEventListener('track', event => {
            this._handleReceivedStream(event.streams[0], otherUserId);
        });

        this._localVideoStream.getTracks().forEach(track => {
            this._peerConnection.addTrack(track, this._localVideoStream);
        });
    },

    /**
     * @param {Number} otherUserId
     * @private
     */
    async _startPeerConnectionNegotiationWithOtherUser(otherUserId) {
        const offerDescription = await this._peerConnection.createOffer();
        await this._peerConnection.setLocalDescription(offerDescription);

        const peerMessage = new PeerMessage(
            PeerMessageCode.OFFER_STREAM, JSON.stringify(offerDescription), this._currentUserId);
        userService.sendMessageToOtherUser(peerMessage, otherUserId);
    },

    /**
     * @param {RTCSessionDescriptionInit} offerDescription
     * @param {Number} offerSenderUserId
     * @private
     */
    async _handleStreamOffer(offerDescription, offerSenderUserId) {
        // Open the local video stream
        if (!await this._openLocalVideoStream()) {
            this._exitFromConference();
            return;
        }

        // Create a WebRTC peer connection
        this._peerConnection = new RTCPeerConnection({
            iceServers: [{
                urls: [this._stunTurnServerConfig.url],
                username: this._stunTurnServerConfig.username,
                credential: this._stunTurnServerConfig.password
            }]
        });

        this._peerConnection.addEventListener('icecandidate', event => {
            this._sendIceCandidateToOtherUser(event.candidate, offerSenderUserId);
        });
        this._peerConnection.addEventListener('track', event => {
            this._handleReceivedStream(event.streams[0], offerSenderUserId);
        });

        await this._peerConnection.setRemoteDescription(offerDescription);

        this._localVideoStream.getTracks().forEach(track => {
            this._peerConnection.addTrack(track, this._localVideoStream);
        });

        const answerDescription = await this._peerConnection.createAnswer();
        await this._peerConnection.setLocalDescription(answerDescription);

        const peerMessage = new PeerMessage(
            PeerMessageCode.ANSWER_STREAM, JSON.stringify(answerDescription), this._currentUserId);
        userService.sendMessageToOtherUser(peerMessage, offerSenderUserId);
    },

    /**
     * @param {RTCSessionDescriptionInit} answerDescription
     * @param {Number} answerSenderUserId
     * @private
     */
    async _handleStreamAnswer(answerDescription, answerSenderUserId) {
        await this._peerConnection.setRemoteDescription(answerDescription);
    },

    /**
     * @param {RTCIceCandidate} iceCandidate
     * @param {Number} otherUserId
     * @private
     */
    _sendIceCandidateToOtherUser(iceCandidate, otherUserId) {
        const peerMessage = new PeerMessage(
            PeerMessageCode.ICE_CANDIDATE, JSON.stringify(iceCandidate), this._currentUserId);
        userService.sendMessageToOtherUser(peerMessage, otherUserId);
    },

    /**
     * @param {RTCIceCandidate} iceCandidate
     * @param {Number} iceCandidateSenderUserId
     * @private
     */
    async _handleReceivedIceCandidate(iceCandidate, iceCandidateSenderUserId) {
        await this._peerConnection.addIceCandidate(iceCandidate);
    },

    /**
     * @param {MediaStream} mediaStream
     * @param {Number} streamSenderUserId
     * @private
     */
    _handleReceivedStream(mediaStream, streamSenderUserId) {
        const videoElement = document.getElementById(`participant-miniature-video-${streamSenderUserId}`);
        videoElement.srcObject = mediaStream;
        this._selectParticipantMiniature(streamSenderUserId);
    },

    /**
     * @param {Number} userId
     * @private
     */
    async _selectParticipantMiniature(userId) {
        const miniatureElements = document.getElementsByClassName('participant-miniature');
        for (let miniatureElement of miniatureElements) {
            const miniatureUserId = Number(miniatureElement.getAttribute('data-user-id'));

            if (miniatureUserId === userId) {
                miniatureElement.classList.add('selected-participant');
            } else {
                miniatureElement.classList.remove('selected-participant');
            }
        }

        const videoElement = document.getElementById(`participant-miniature-video-${userId}`);
        this._selectedParticipantVideo.srcObject = videoElement.srcObject;
        await this._selectedParticipantVideo.play();

        this._selectedParticipantVideo.style.height = (this._selectedParticipantPanel.clientHeight * .8) + 'px';
    },

    /**
     * @return {Promise<boolean>} true = opened with success, false = not opened
     * @private
     */
    async _openLocalVideoStream() {
        // Get the media stream
        try {
            this._localVideoStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
        } catch (e) {
            alert(`Unable to open the local media stream: ${e.message}`);
            return false;
        }

        // Update the participant video element
        const videoElement = document.getElementById(`participant-miniature-video-${this._currentUserId}`);
        videoElement.srcObject = this._localVideoStream;
        return true;
    }
};

export default conferencePanelController;