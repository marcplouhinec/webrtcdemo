import userService from '../services/userService.js'

const conferencePanelController = {

    /** @type {HTMLElement} */
    _selectedParticipantPanel: null,
    /** @type {HTMLElement} */
    _participantMiniaturesPanel: null,

    init() {
        this._selectedParticipantPanel = document.getElementById('selected-participant-panel');
        this._participantMiniaturesPanel = document.getElementById('participant-miniatures-panel');

        this._selectedParticipantPanel.style.display = 'none';
        this._participantMiniaturesPanel.style.display = 'none';
    },

    /**
     * @param {Number} callerUserId
     * @param {Number} otherUserId
     */
    async onConferenceCallStarted(callerUserId, otherUserId) {
        const callerUser = await userService.findUserById(callerUserId);
        const otherUser = await userService.findUserById(otherUserId);

        // TODO
        console.log(callerUser);
        console.log(otherUser);
    },

    onConferenceCallEnded() {
        // TODO
        console.log('onConferenceCallEnded');
    }

};

export default conferencePanelController;