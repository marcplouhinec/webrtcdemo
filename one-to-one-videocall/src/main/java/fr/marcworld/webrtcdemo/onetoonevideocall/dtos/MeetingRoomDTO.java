package fr.marcworld.webrtcdemo.onetoonevideocall.dtos;

import fr.marcworld.webrtcdemo.onetoonevideocall.entities.User;

import java.time.ZonedDateTime;
import java.util.List;

public class MeetingRoomDTO {

    private Integer id;
    private ZonedDateTime lastUpdateDateTime;
    private String name;
    private List<User> users;

    public MeetingRoomDTO() {
    }

    public MeetingRoomDTO(Integer id, ZonedDateTime lastUpdateDateTime, String name, List<User> users) {
        this.id = id;
        this.lastUpdateDateTime = lastUpdateDateTime;
        this.name = name;
        this.users = users;
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

    public List<User> getUsers() {
        return users;
    }

    public void setUsers(List<User> users) {
        this.users = users;
    }
}
