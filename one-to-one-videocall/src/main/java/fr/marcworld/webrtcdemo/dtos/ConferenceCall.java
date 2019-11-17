package fr.marcworld.webrtcdemo.dtos;

public class ConferenceCall {

    private int callerUserId;
    private int otherUserId;
    private int roomNumber;

    public ConferenceCall() {
    }

    public ConferenceCall(int callerUserId, int otherUserId, int roomNumber) {
        this.callerUserId = callerUserId;
        this.otherUserId = otherUserId;
        this.roomNumber = roomNumber;
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

    public int getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(int roomNumber) {
        this.roomNumber = roomNumber;
    }
}
