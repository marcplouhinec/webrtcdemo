package fr.marcworld.webrtcdemo.onetoonevideocall.repositories;

import fr.marcworld.webrtcdemo.onetoonevideocall.entities.InactiveUserDeletionResult;
import fr.marcworld.webrtcdemo.onetoonevideocall.entities.User;
import fr.marcworld.webrtcdemo.onetoonevideocall.exceptions.UserAlreadyExistsException;

import java.util.List;

public interface UserRepository {

    User create(User user) throws UserAlreadyExistsException;

    List<User> findAll();

    User findById(int userId);

    /**
     * @return Users in the conference room.
     */
    List<User> startConferenceCall(int callerUserId, int otherUserId);

    List<User> findAllInConferenceRoomNumber(int conferenceRoomNumber);

    void exitFromConferenceCall(List<Integer> userIds);

    /**
     * @return Deleted users.
     */
    InactiveUserDeletionResult deleteUsersInactiveForOneMinute();

    void markUserAsActive(int userId);

}
