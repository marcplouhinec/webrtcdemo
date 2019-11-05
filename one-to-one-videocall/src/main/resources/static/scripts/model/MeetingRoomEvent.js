class MeetingRoomEvent {

    /**
     * @param {{code: MeetingRoomEventCode, meetingRoomId: Number, username: String}} properties
     */
    static fromProperties(properties) {
        return new MeetingRoomEvent(
            properties.code,
            properties.meetingRoomId,
            properties.username);
    }

    /**
     * @param {MeetingRoomEventCode} code
     * @param {Number} meetingRoomId
     * @param {String} username
     */
    constructor(code, meetingRoomId, username) {
        this.code = code;
        this.meetingRoomId = meetingRoomId;
        this.username = username;
    }
}

export default MeetingRoomEvent;