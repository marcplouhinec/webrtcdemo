/**
 * @readonly
 * @enum {String}
 */
const UserServerEventCode = {
    CONFERENCE_CALL_STARTED: 'CONFERENCE_CALL_STARTED',
    CONFERENCE_CALL_ENDED: 'CONFERENCE_CALL_ENDED',

    PEER_MESSAGE_SENT: 'PEER_MESSAGE_SENT',

    HEARTBEAT_PING: 'HEARTBEAT_PING'
};

export default UserServerEventCode;