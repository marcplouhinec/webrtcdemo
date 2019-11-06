package fr.marcworld.webrtcdemo.onetoonevideocall.repositories;

import fr.marcworld.webrtcdemo.onetoonevideocall.exceptions.EntityNotFoundException;
import fr.marcworld.webrtcdemo.onetoonevideocall.entities.MeetingRoom;

import java.util.List;
import java.util.Set;

public interface MeetingRoomRepository {

    MeetingRoom create(MeetingRoom meetingRoom);

    MeetingRoom findById(int id);

    List<MeetingRoom> findAll();

    void deleteMeetingRoomById(int id) throws EntityNotFoundException;

    /**
     * @return Number of deleted rooms.
     */
    int deleteEmptyMeetingRoomsThatHaveNotBeenUpdatedSince1min(Set<Integer> usedMeetingRoomIds);

}
