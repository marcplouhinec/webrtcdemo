package fr.marcworld.webrtcdemo.onetoonevideocall.dtos;

public enum StartConferenceResponseCode {
    SUCCESS,

    UNKNOWN_CALLER_USER_ID,
    UNKNOWN_OTHER_USER_ID,

    CALLER_USER_ALREADY_IN_CONFERENCE,
    OTHER_USER_ALREADY_IN_CONFERENCE,
}
