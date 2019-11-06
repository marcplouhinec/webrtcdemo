package fr.marcworld.webrtcdemo.onetoonevideocall.repositories;

import fr.marcworld.webrtcdemo.onetoonevideocall.entities.User;
import fr.marcworld.webrtcdemo.onetoonevideocall.exceptions.EntityNotFoundException;
import fr.marcworld.webrtcdemo.onetoonevideocall.exceptions.MeetingRoomFullException;
import fr.marcworld.webrtcdemo.onetoonevideocall.exceptions.UserAlreadyExistsException;

import java.util.List;
import java.util.Set;

public interface UserRepository {

    User create(User user) throws UserAlreadyExistsException;

    List<User> findAllWhereMeetingRoomIdIsNotNull();

    User findByName(String name);

    long countByMeetingRoomId(int meetingRoomId);

    User deleteById(int userId);

    void enterIntoMeetingRoom(int userId, int meetingRoomId) throws EntityNotFoundException, MeetingRoomFullException;

    Set<Integer> findUsedMeetingRoomIds();

}
