import userService from '../services/userService.js'

const conferencePanelController = {

    /** @type {HTMLElement} */
    _selectedParticipantPanel: null,
    /** @type {HTMLElement} */
    _participantMiniaturesPanel: null,
    /** @type {Number} */
    _currentUserId: null,

    init() {
        this._selectedParticipantPanel = document.getElementById('selected-participant-panel');
        this._participantMiniaturesPanel = document.getElementById('participant-miniatures-panel');

        this._selectedParticipantPanel.style.display = 'none';
        this._participantMiniaturesPanel.style.display = 'none';

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
                    <div class="participant-miniature-video"></div>
                    <div class="participant-miniature-name">${participant.name}</div>
                </div>`;
            })
            .join('\n');

        this._selectedParticipantPanel.style.display = 'flex';
        this._participantMiniaturesPanel.style.display = 'flex';
    },

    onConferenceCallEnded() {
        this._participantMiniaturesPanel.innerHTML = '';
        this._selectedParticipantPanel.style.display = 'none';
        this._participantMiniaturesPanel.style.display = 'none';
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