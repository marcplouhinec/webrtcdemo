import User from '../model/User.js'
import StartConferenceResponseCode from '../model/StartConferenceResponseCode.js'
import ExitFromConferenceCallResponseCode from '../model/ExitFromConferenceCallResponseCode.js'
import UserServerEvent from '../model/UserServerEvent.js'
import UserServerEventCode from '../model/UserServerEventCode.js'

const userService = {

    _stompClient: null,

    /**
     * @param {User} user
     * @return {Promise<User>}
     */
    async createUser(user) {
        const response = await fetch('/users', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: user.name
            })
        });
        if (response.status === 400) {
            throw new Error('A user with this name already exists.');
        }
        const userProperties = await response.json();
        return User.fromProperties(userProperties);
    },

    /**
     * @return {Promise<User[]>}
     */
    async findAllUsers() {
        const response = await fetch('/users', {method: 'GET'});
        const usersProperties = await response.json();

        if (!Array.isArray(usersProperties)) {
            return [];
        }
        return usersProperties.map(it => User.fromProperties(it));
    },

    /**
     * @param {Number} callerUserId
     * @param {Number} otherUserId
     * @return {Promise<void>}
     */
    async startConferenceCall(callerUserId, otherUserId) {
        const response = await fetch(`/users/${callerUserId}/start-conference-call`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(otherUserId)
        });
        const responseCode = await response.json();
        switch (responseCode) {
            case StartConferenceResponseCode.UNKNOWN_CALLER_USER_ID:
                throw new Error(`Unknown caller (userId: ${callerUserId}).`);
            case StartConferenceResponseCode.CALLER_USER_ALREADY_IN_CONFERENCE:
                throw new Error('The caller is already in another conference call.');
            case StartConferenceResponseCode.UNKNOWN_OTHER_USER_ID:
                throw new Error(`Unknown callee (userId: ${otherUserId}).`);
            case StartConferenceResponseCode.OTHER_USER_ALREADY_IN_CONFERENCE:
                throw new Error('The callee is already in another conference call.');
            case StartConferenceResponseCode.SUCCESS:
                return;
        }
    },

    /**
     * @param {Number} userId
     * @return {Promise<void>}
     */
    async exitFromConferenceCall(userId) {
        const response = await fetch(`/users/${userId}/exit-from-conference-call`, {
            method: 'POST'
        });
        const responseCode = await response.json();
        switch (responseCode) {
            case ExitFromConferenceCallResponseCode.UNKNOWN_USER_ID:
                throw new Error(`Unknown user (userId: ${userId}).`);
            case ExitFromConferenceCallResponseCode.USER_NOT_IN_CONFERENCE_CALL:
                throw new Error('User not in conference call.');
            case ExitFromConferenceCallResponseCode.SUCCESS:
                return;
        }
    },

    /**
     * @param {function(users: User[])} listener
     */
    async subscribeToUsersUpdateEvent(listener) {
        const stompClient = await this._getStompClient();

        stompClient.subscribe('/topic/users', response => {
            const usersProperties = JSON.parse(response.body);
            if (!Array.isArray(usersProperties)) {
                return;
            }

            const users = usersProperties.map(it => User.fromProperties(it));
            listener(users);
        });
    },

    /**
     * @param {Number} userId
     * @param {function(event: UserServerEvent)} listener
     * @return {Promise<void>}
     */
    async subscribeToUserEvents(userId, listener) {
        const stompClient = await this._getStompClient();

        stompClient.subscribe(`/topic/user-${userId}`, response => {
            const event = UserServerEvent.fromProperties(JSON.parse(response.body));

            if (event.code === UserServerEventCode.HEARTBEAT_PING) {
                stompClient.send(`/app/user-${userId}/heartbeat-pong`, {}, '');
                return;
            }

            listener(event);
        });
    },

    /**
     * @return {Promise<Client>}
     * @private
     */
    _getStompClient() {
        return new Promise((resolve) => {
            if (this._stompClient) {
                return resolve(this._stompClient);
            }

            const socket = new SockJS('/stomp-endpoint');
            const stompClient = Stomp.over(socket);
            stompClient.connect({}, () => {
                this._stompClient = stompClient;
                return resolve(this._stompClient);
            });
        });
    }
};

export default userService;