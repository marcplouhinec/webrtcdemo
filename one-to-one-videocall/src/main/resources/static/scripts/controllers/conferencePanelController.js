import userService from '../services/userService.js'

const conferencePanelController = {

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