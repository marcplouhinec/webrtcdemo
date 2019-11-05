package fr.marcworld.webrtcdemo.onetoonevideocall.model;

import java.time.ZonedDateTime;
import java.util.List;

public class MeetingRoom {

    private Integer id;
    private ZonedDateTime creationDateTime;
    private ZonedDateTime lastUpdateDateTime;
    private String name;
    private List<String> usernames;

    public MeetingRoom() {
    }

    public MeetingRoom(Integer id,
                       ZonedDateTime creationDateTime,
                       ZonedDateTime lastUpdateDateTime,
                       String name,
                       List<String> usernames) {
        this.id = id;
        this.creationDateTime = creationDateTime;
        this.lastUpdateDateTime = lastUpdateDateTime;
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

    public ZonedDateTime getLastUpdateDateTime() {
        return lastUpdateDateTime;
    }

    public void setLastUpdateDateTime(ZonedDateTime lastUpdateDateTime) {
        this.lastUpdateDateTime = lastUpdateDateTime;
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
