package fr.marcworld.webrtcdemo.onetoonevideocall.entities;

import java.time.ZonedDateTime;

public class MeetingRoom {

    private Integer id;
    private ZonedDateTime lastUpdateDateTime;
    private String name;

    public MeetingRoom() {
    }

    public MeetingRoom(Integer id,
                       ZonedDateTime lastUpdateDateTime,
                       String name) {
        this.id = id;
        this.lastUpdateDateTime = lastUpdateDateTime;
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
}
