package fr.marcworld.webrtcdemo.onetoonevideocall.model;

public enum MeetingRoomEventCode {
    // From server to client
    USER_HAS_ENTERED,
    USER_HAS_EXITED,
    USERNAME_ALREADY_EXIST,
    USER_REJECTED_BECAUSE_ROOM_FULL,
    USER_HEARTBEAT_PING,
    UNKNOWN_MEETING_ROOM,

    // From client to server
    USER_HEARTBEAT_PONG,
    ENTER_INTO_MEETING_ROOM,
    EXIT_FROM_MEETING_ROOM,
}
