package fr.marcworld.webrtcdemo.entities;

import java.time.ZonedDateTime;
import java.util.Objects;

public class User {

    private Integer id;
    private ZonedDateTime lastUpdateDateTime;
    private String name;
    private Integer conferenceRoomNumber;

    public User() {
    }

    public User(Integer id, ZonedDateTime lastUpdateDateTime, String name, Integer conferenceRoomNumber) {
        this.id = id;
        this.lastUpdateDateTime = lastUpdateDateTime;
        this.name = name;
        this.conferenceRoomNumber = conferenceRoomNumber;
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

    public Integer getConferenceRoomNumber() {
        return conferenceRoomNumber;
    }

    public void setConferenceRoomNumber(Integer conferenceRoomNumber) {
        this.conferenceRoomNumber = conferenceRoomNumber;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", name='" + name + '\'' +
                '}';
    }
}
