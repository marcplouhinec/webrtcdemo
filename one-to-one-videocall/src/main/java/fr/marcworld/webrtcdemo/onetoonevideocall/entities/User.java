package fr.marcworld.webrtcdemo.onetoonevideocall.entities;

import java.time.ZonedDateTime;

public class User {

    private Integer id;
    private ZonedDateTime lastUpdateDateTime;
    private String name;
    private Integer meetingRoomId;

    public User() {
    }

    public User(Integer id, ZonedDateTime lastUpdateDateTime, String name, Integer meetingRoomId) {
        this.id = id;
        this.lastUpdateDateTime = lastUpdateDateTime;
        this.name = name;
        this.meetingRoomId = meetingRoomId;
    }

    public User(String name) {
        this.name = name;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public ZonedDateTime getLastUpdateDateTime() {
        return lastUpdateDateTime;
    }

    public void setLastUpdateDateTime(ZonedDateTime lastUpdateDateTime) {
        this.lastUpdateDateTime = lastUpdateDateTime;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getMeetingRoomId() {
        return meetingRoomId;
    }

    public void setMeetingRoomId(Integer meetingRoomId) {
        this.meetingRoomId = meetingRoomId;
    }
}
