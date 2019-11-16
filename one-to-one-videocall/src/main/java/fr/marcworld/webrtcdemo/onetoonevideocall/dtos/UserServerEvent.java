package fr.marcworld.webrtcdemo.onetoonevideocall.dtos;

public class UserServerEvent<T> {

    private UserServerEventCode code;
    private T payload;

    public UserServerEvent() {
    }

    public UserServerEvent(UserServerEventCode code) {
        this(code, null);
    }

    public UserServerEvent(UserServerEventCode code, T payload) {
        this.code = code;
        this.payload = payload;
    }

    public UserServerEventCode getCode() {
        return code;
    }

    public void setCode(UserServerEventCode code) {
        this.code = code;
    }

    public T getPayload() {
        return payload;
    }

    public void setPayload(T payload) {
        this.payload = payload;
    }
}
