import userService from '../services/userService.js'
import PeerMessage from '../model/PeerMessage.js'
import PeerMessageCode from '../model/PeerMessageCode.js'

const conferencePanelController = {

    /** @type {HTMLElement} */
    _selectedParticipantPanel: null,
    /** @type {HTMLElement} */
    _participantMiniaturesPanel: null,
    /** @type {Number} */
    _currentUserId: null,
    /** @type {MediaStream} */
    _localVideoStream: null,
    /** @type {RTCPeerConnection} */
    _peerConnection: null,

    init() {
        this._selectedParticipantPanel = document.getElementById('selected-participant-panel');
        this._participantMiniaturesPanel = document.getElementById('participant-miniatures-panel');

        this._selectedParticipantPanel.style.display = 'none';
        this._participantMiniaturesPanel.style.display = 'none';

        this._showMessage('Please call an user to start a conference call.');

        const exitConferenceButton = document.getElementById('exit-from-conference');
        exitConferenceButton.addEventListener('click', () => {
            this._exitFromConference();
        });
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

                return `<div class="participant-miniature">
                    <video class="participant-miniature-video"
                           id="participant-miniature-video-${participant.id}"
                           autoplay="autoplay" ${isMuted ? 'muted="muted"' : ''}></video>
                    <div class="participant-miniature-name">${participant.name}</div>
                </div>`;
            })
            .join('\n');

        this._showMessage('');
        this._selectedParticipantPanel.style.display = 'flex';
        this._participantMiniaturesPanel.style.display = 'flex';

        // If the current user is the caller, initiate the peer connection
        if (currentUserId === callerUserId) {
            this._initiatePeerConnectionToOtherUser(otherUserId);
        }
    },

    onConferenceCallEnded() {
        if (this._peerConnection) {
            this._peerConnection.close();
        }
        // remoteVideo.srcObject.getTracks().forEach(track => track.stop());
        const videoElements = document.getElementsByClassName('participant-miniature-video');
        for (let videoElement of videoElements) {
            videoElement.srcObject.getTracks().forEach(track => track.stop());
        }
        if (this._localVideoStream) {
            this._localVideoStream = null;
        }

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
        this._localVideoStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        const videoElement = document.getElementById(`participant-miniature-video-${this._currentUserId}`);
        videoElement.srcObject = this._localVideoStream;

        // Create a WebRTC peer connection
        this._peerConnection = new RTCPeerConnection(null); // TODO get the configuration from the server

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
        this._localVideoStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        const videoElement = document.getElementById(`participant-miniature-video-${this._currentUserId}`);
        videoElement.srcObject = this._localVideoStream;

        // Create a WebRTC peer connection
        this._peerConnection = new RTCPeerConnection(null); // TODO get the configuration from the server

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
    }
};

export default conferencePanelController;