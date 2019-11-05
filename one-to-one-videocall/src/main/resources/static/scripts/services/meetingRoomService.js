import MeetingRoom from '../model/MeetingRoom.js';
import MeetingRoomResponseCode from '../model/MeetingRoomResponseCode.js';
import MeetingRoomEvent from '../model/MeetingRoomEvent.js';
import MeetingRoomEventCode from '../model/MeetingRoomEventCode.js';

const meetingRoomService = {

    /** @type {*|Client|Client} */
    _stompClient: null,

    /** @type {Array<function(meetingRooms: MeetingRoom[])>} */
    _meetingsListeners: [],

    /** @type {Object.<String, {unsubscribe:function(), id: Object}>} */
    _meetingRoomEventSubscriptionByMeetingRoomId: {},

    async _getStompClient() {
        return new Promise((resolve) => {
            if (this._stompClient) {
                return resolve(this._stompClient);
            }

            const socket = new SockJS('/stomp-endpoint');
            this._stompClient = Stomp.over(socket);
            this._stompClient.connect({}, () => {
                return resolve(this._stompClient);
            });
        });
    },

    /**
     * @param {String} meetingRoomName
     * @return {Promise<MeetingRoom>}
     */
    async createMeetingRoomByName(meetingRoomName) {
        const response = await fetch('/meeting-rooms', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name: meetingRoomName})
        });
        const meetingRoomProperties = await response.json();
        return MeetingRoom.fromProperties(meetingRoomProperties);
    },

    /**
     * @return {Promise<MeetingRoom[]>}
     */
    async findAllMeetingRooms() {
        const response = await fetch('/meeting-rooms', {
            method: 'GET'
        });
        const meetingRoomsProperties = await response.json();

        if (!Array.isArray(meetingRoomsProperties)) {
            return [];
        }
        return meetingRoomsProperties
            .map(meetingRoomProperties => MeetingRoom.fromProperties(meetingRoomProperties));
    },

    /**
     * @param {Number} meetingRoomId
     * @return {Promise<void>}
     */
    async deleteMeetingRoomById(meetingRoomId) {
        const response = await fetch(`/meeting-rooms/${meetingRoomId}`, {
            method: 'DELETE'
        });
        const responseCode = await response.json();

        switch (responseCode) {
            case MeetingRoomResponseCode.SUCCESS:
                return;
            case MeetingRoomResponseCode.UNKNOWN_MEETING_ROOM_ID:
                throw new Error(`Unknown meeting room ID: ${meetingRoomId}`);
            case MeetingRoomResponseCode.MEETING_ROOM_NOT_EMPTY:
                throw new Error('Unable to delete a non-empty room.');
            default:
                throw new Error('Unknown response code');
        }
    },

    /**
     * @param {function(meetingRooms: MeetingRoom[])} onMeetingRoomsUpdated
     */
    async subscribeToMeetingRoomUpdateEvent(onMeetingRoomsUpdated) {
        const stompClient = await this._getStompClient();

        stompClient.subscribe('/topic/meeting-rooms', response => {
            const meetingRoomsProperties = JSON.parse(response.body);
            const meetingRooms = meetingRoomsProperties
                .map(meetingRoomProperties => MeetingRoom.fromProperties(meetingRoomProperties));
            onMeetingRoomsUpdated(meetingRooms);
        });
    },

    /**
     * @param {Number} meetingRoomId
     * @param {function(event: MeetingRoomEvent)} onMeetingRoomEvent
     * @return {Promise<void>}
     */
    async subscribeToMeetingRoomEvents(meetingRoomId, onMeetingRoomEvent) {
        const stompClient = await this._getStompClient();

        /**
         * @type {{unsubscribe:function, id}}
         */
        const subscription = stompClient.subscribe(`/topic/meeting-room-${meetingRoomId}`, response => {
            const eventProperties = JSON.parse(response.body);
            const event = MeetingRoomEvent.fromProperties(eventProperties);

            onMeetingRoomEvent(event);
        });
        this._meetingRoomEventSubscriptionByMeetingRoomId[meetingRoomId] = subscription;
    },

    /**
     * @param {Number} meetingRoomId
     */
    async unsubscribeFromMeetingRoomEvents(meetingRoomId) {
        const stompClient = await this._getStompClient();

        const subscription = this._meetingRoomEventSubscriptionByMeetingRoomId[meetingRoomId];
        if (subscription) {
            stompClient.unsubscribe(subscription.id);
        }
    },

    /**
     * @param {Number} meetingRoomId
     * @param {String} username
     */
    async enterIntoMeetingRoom(meetingRoomId, username) {
        const stompClient = await this._getStompClient();

        const event = new MeetingRoomEvent(
            MeetingRoomEventCode.ENTER_INTO_MEETING_ROOM,
            meetingRoomId,
            username);
        stompClient.send(
            `/app/meeting-room-${meetingRoomId}/${MeetingRoomEventCode.ENTER_INTO_MEETING_ROOM}`,
            {},
            JSON.stringify(event));
    },

    /**
     * @param {Number} meetingRoomId
     * @param {String} username
     */
    async exitFromMeetingRoom(meetingRoomId, username) {
        const stompClient = await this._getStompClient();

        const event = new MeetingRoomEvent(
            MeetingRoomEventCode.EXIT_FROM_MEETING_ROOM,
            meetingRoomId,
            username);
        stompClient.send(
            `/app/meeting-room-${meetingRoomId}/${MeetingRoomEventCode.EXIT_FROM_MEETING_ROOM}`,
            {},
            JSON.stringify(event));
    },

    /**
     * @param {Number} meetingRoomId
     * @param {String} username
     * @return {Promise<void>}
     */
    async notifyUserIsInMeetingRoom(meetingRoomId, username) {
        const stompClient = await this._getStompClient();

        const event = new MeetingRoomEvent(
            MeetingRoomEventCode.USER_HEARTBEAT_PONG,
            meetingRoomId,
            username);
        stompClient.send(
            `/app/meeting-room-${meetingRoomId}/${MeetingRoomEventCode.USER_HEARTBEAT_PONG}`,
            {},
            JSON.stringify(event));
    }
};

export default meetingRoomService;