package fr.marcworld.webrtcdemo.entities;

import java.util.List;

public class InactiveUserDeletionResult {

    private List<User> deletedUsers;
    private List<Integer> cancelledConferenceRoomNumbers;
    private List<User> otherUsersInCancelledConferenceCalls;

    public InactiveUserDeletionResult() {
    }

    public InactiveUserDeletionResult(
            List<User> deletedUsers,
            List<Integer> cancelledConferenceRoomNumbers,
            List<User> otherUsersInCancelledConferenceCalls) {

        this.deletedUsers = deletedUsers;
        this.cancelledConferenceRoomNumbers = cancelledConferenceRoomNumbers;
        this.otherUsersInCancelledConferenceCalls = otherUsersInCancelledConferenceCalls;
    }

    public List<User> getDeletedUsers() {
        return deletedUsers;
    }

    public void setDeletedUsers(List<User> deletedUsers) {
        this.deletedUsers = deletedUsers;
    }

    public List<Integer> getCancelledConferenceRoomNumbers() {
        return cancelledConferenceRoomNumbers;
    }

    public void setCancelledConferenceRoomNumbers(List<Integer> cancelledConferenceRoomNumbers) {
        this.cancelledConferenceRoomNumbers = cancelledConferenceRoomNumbers;
    }

    public List<User> getOtherUsersInCancelledConferenceCalls() {
        return otherUsersInCancelledConferenceCalls;
    }

    public void setOtherUsersInCancelledConferenceCalls(List<User> otherUsersInCancelledConferenceCalls) {
        this.otherUsersInCancelledConferenceCalls = otherUsersInCancelledConferenceCalls;
    }
}
