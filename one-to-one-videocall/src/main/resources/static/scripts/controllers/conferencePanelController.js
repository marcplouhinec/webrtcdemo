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
                return `<div class="participant-miniature">
                    <video class="participant-miniature-video"
                           id="participant-miniature-video-${participant.id}"
                           autoplay="autoplay"></video>
                    <div class="participant-miniature-name">${participant.name}</div>
                </div>`;
            })
            .join('\n');

        this._showMessage('');
        this._selectedParticipantPanel.style.display = 'flex';
        this._participantMiniaturesPanel.style.display = 'flex';

        // Open the local video stream
        this._localVideoStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        const videoElement = document.getElementById(`participant-miniature-video-${this._currentUserId}`);
        videoElement.srcObject = this._localVideoStream;

        // If the current user is the caller, initiate the peer connection
        if (currentUserId === callerUserId) {
            this._initiatePeerConnectionToOtherUser(otherUserId);
        }
    },

    onConferenceCallEnded() {
        if (this._peerConnection) {
            this._peerConnection.close();
        }
        if (this._localVideoStream) {
            this._localVideoStream.getTracks().forEach(track => {
                track.stop();
            });
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
                this._handleStreamOffer(JSON.parse(peerMessage.jsonPayload));
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
    _initiatePeerConnectionToOtherUser(otherUserId) {
        this._peerConnection = new RTCPeerConnection(null); // TODO get the configuration from the server

        this._peerConnection.addEventListener('negotiationneeded', () => {
            this._startPeerConnectionNegotiationWithOtherUser(otherUserId);
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
        const description = await this._peerConnection.createOffer();
        await this._peerConnection.setLocalDescription(description);

        const peerMessage = new PeerMessage(
            PeerMessageCode.OFFER_STREAM,
            JSON.stringify(description),
            this._currentUserId);
        userService.sendMessageToOtherUser(peerMessage, otherUserId);
    },

    /**
     * @param {RTCSessionDescription} description
     * @private
     */
    _handleStreamOffer(description) {
        console.log(description);
        // TODO
    }
};

export default conferencePanelController;