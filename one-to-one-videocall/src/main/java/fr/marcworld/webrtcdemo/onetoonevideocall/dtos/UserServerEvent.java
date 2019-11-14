package fr.marcworld.webrtcdemo.onetoonevideocall.dtos;

public class UserServerEvent {

    private UserServerEventCode code;

    public UserServerEvent() {
    }

    public UserServerEvent(UserServerEventCode code) {
        this.code = code;
    }

    public UserServerEventCode getCode() {
        return code;
    }

    public void setCode(UserServerEventCode code) {
        this.code = code;
    }
}
