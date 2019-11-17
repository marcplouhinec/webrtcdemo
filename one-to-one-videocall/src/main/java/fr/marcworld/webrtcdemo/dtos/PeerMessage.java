package fr.marcworld.webrtcdemo.dtos;

public class PeerMessage {

    private PeerMessageCode code;
    private String jsonPayload;
    private int senderUserId;

    public PeerMessage() {
    }

    public PeerMessage(PeerMessageCode code, String jsonPayload, int senderUserId) {
        this.code = code;
        this.jsonPayload = jsonPayload;
        this.senderUserId = senderUserId;
    }

    public PeerMessageCode getCode() {
        return code;
    }

    public void setCode(PeerMessageCode code) {
        this.code = code;
    }

    public String getJsonPayload() {
        return jsonPayload;
    }

    public void setJsonPayload(String jsonPayload) {
        this.jsonPayload = jsonPayload;
    }

    public int getSenderUserId() {
        return senderUserId;
    }

    public void setSenderUserId(int senderUserId) {
        this.senderUserId = senderUserId;
    }

    @Override
    public String toString() {
        return "PeerMessage{" +
                "code=" + code +
                ", jsonPayload='" + jsonPayload + '\'' +
                ", senderUserId=" + senderUserId +
                '}';
    }
}
