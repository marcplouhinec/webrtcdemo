import userService from '../services/userService.js'

const conferencePanelController = {

    /** @type {HTMLElement} */
    _selectedParticipantPanel: null,
    /** @type {HTMLElement} */
    _participantMiniaturesPanel: null,
    /** @type {Number} */
    _currentUserId: null,
    /** @type {MediaStream} */
    _localVideoStream: null,

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
        /**
         *
         * @type {MediaStream}
         */
        this._localVideoStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        const videoElement = document.getElementById(`participant-miniature-video-${this._currentUserId}`);
        videoElement.srcObject = this._localVideoStream;
    },

    onConferenceCallEnded() {
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
    }
};

export default conferencePanelController;