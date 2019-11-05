package fr.marcworld.webrtcdemo.onetoonevideocall.model;

import java.time.ZonedDateTime;
import java.util.List;

public class MeetingRoom {

    private Integer id;
    private ZonedDateTime creationDateTime;
    private String name;
    private List<String> usernames;

    public MeetingRoom() {
    }

    public MeetingRoom(Integer id, ZonedDateTime creationDateTime, String name, List<String> usernames) {
        this.id = id;
        this.creationDateTime = creationDateTime;
        this.name = name;
        this.usernames = usernames;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public ZonedDateTime getCreationDateTime() {
        return creationDateTime;
    }

    public void setCreationDateTime(ZonedDateTime creationDateTime) {
        this.creationDateTime = creationDateTime;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<String> getUsernames() {
        return usernames;
    }

    public void setUsernames(List<String> usernames) {
        this.usernames = usernames;
    }
}
