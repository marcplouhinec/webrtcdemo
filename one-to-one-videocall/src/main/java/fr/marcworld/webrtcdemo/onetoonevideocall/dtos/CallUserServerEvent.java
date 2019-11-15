package fr.marcworld.webrtcdemo.onetoonevideocall.dtos;

public class CallUserServerEvent extends UserServerEvent {

    private int callerUserId;
    private int otherUserId;

    public CallUserServerEvent() {
        super();
    }

    public CallUserServerEvent(UserServerEventCode code, int callerUserId, int otherUserId) {
        super(code);
        this.callerUserId = callerUserId;
        this.otherUserId = otherUserId;
    }

    public int getCallerUserId() {
        return callerUserId;
    }

    public void setCallerUserId(int callerUserId) {
        this.callerUserId = callerUserId;
    }

    public int getOtherUserId() {
        return otherUserId;
    }

    public void setOtherUserId(int otherUserId) {
        this.otherUserId = otherUserId;
    }
}
