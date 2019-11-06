package fr.marcworld.webrtcdemo.onetoonevideocall.dtos;

public class MeetingRoomEvent {

    private MeetingRoomEventCode code;
    private int meetingRoomId;
    private String username;

    public MeetingRoomEvent() {
    }

    public MeetingRoomEvent(MeetingRoomEventCode code, int meetingRoomId, String username) {
        this.code = code;
        this.meetingRoomId = meetingRoomId;
        this.username = username;
    }

    public MeetingRoomEventCode getCode() {
        return code;
    }

    public void setCode(MeetingRoomEventCode code) {
        this.code = code;
    }

    public int getMeetingRoomId() {
        return meetingRoomId;
    }

    public void setMeetingRoomId(int meetingRoomId) {
        this.meetingRoomId = meetingRoomId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
