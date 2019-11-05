package fr.marcworld.webrtcdemo.onetoonevideocall.repositories;

import fr.marcworld.webrtcdemo.onetoonevideocall.exceptions.MeetingRoomFullException;
import fr.marcworld.webrtcdemo.onetoonevideocall.exceptions.MeetingRoomNotEmptyException;
import fr.marcworld.webrtcdemo.onetoonevideocall.exceptions.UserAlreadyExistsException;
import fr.marcworld.webrtcdemo.onetoonevideocall.model.MeetingRoom;

import java.util.List;

public interface MeetingRoomRepository {

    MeetingRoom create(MeetingRoom meetingRoom);

    List<MeetingRoom> findAll();

    void deleteMeetingRoomById(int id) throws MeetingRoomNotEmptyException;

    MeetingRoom addUserToMeetingRoom(int id, String username)
            throws MeetingRoomFullException, UserAlreadyExistsException;

    MeetingRoom removeUserFromMeetingRoom(int id, String username);

}
