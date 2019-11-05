/**
 * @readonly
 * @enum {String}
 */
const MeetingRoomEventCode = {
    // From server to client
    USER_HAS_ENTERED: 'USER_HAS_ENTERED',
    USER_HAS_EXITED: 'USER_HAS_EXITED',
    USERNAME_ALREADY_EXIST: 'USERNAME_ALREADY_EXIST',
    USER_REJECTED_BECAUSE_ROOM_FULL: 'USER_REJECTED_BECAUSE_ROOM_FULL',
    USER_HEARTBEAT_PING: 'USER_HEARTBEAT_PING',
    UNKNOWN_MEETING_ROOM: 'UNKNOWN_MEETING_ROOM',

    // From client to server
    USER_HEARTBEAT_PONG: 'USER_HEARTBEAT_PONG',
    ENTER_INTO_MEETING_ROOM: 'ENTER_INTO_MEETING_ROOM',
    EXIT_FROM_MEETING_ROOM: 'EXIT_FROM_MEETING_ROOM',
};

export default MeetingRoomEventCode;