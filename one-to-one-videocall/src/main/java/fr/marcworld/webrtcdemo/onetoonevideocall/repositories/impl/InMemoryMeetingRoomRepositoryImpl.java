package fr.marcworld.webrtcdemo.onetoonevideocall.repositories.impl;

import fr.marcworld.webrtcdemo.onetoonevideocall.exceptions.EntityNotFoundException;
import fr.marcworld.webrtcdemo.onetoonevideocall.entities.MeetingRoom;
import fr.marcworld.webrtcdemo.onetoonevideocall.repositories.MeetingRoomRepository;
import org.springframework.stereotype.Repository;

import java.time.Duration;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Repository
public class InMemoryMeetingRoomRepositoryImpl implements MeetingRoomRepository {

    private final Map<Integer, MeetingRoom> meetingRoomById = new TreeMap<>();
    private final AtomicInteger nextId = new AtomicInteger();

    @Override
    public MeetingRoom create(MeetingRoom meetingRoom) {
        ZonedDateTime now = ZonedDateTime.now();
        MeetingRoom newMeetingRoom = new MeetingRoom(nextId.getAndIncrement(), now, meetingRoom.getName());

        synchronized (meetingRoomById) {
            meetingRoomById.put(newMeetingRoom.getId(), newMeetingRoom);
        }
        return copy(newMeetingRoom);
    }

    @Override
    public MeetingRoom findById(int id) {
        synchronized (meetingRoomById) {
            MeetingRoom meetingRoom = meetingRoomById.get(id);
            if (meetingRoom == null) {
                return null;
            }
            return copy(meetingRoom);
        }
    }

    @Override
    public List<MeetingRoom> findAll() {
        synchronized (meetingRoomById) {
            return meetingRoomById.values().stream()
                    .map(this::copy)
                    .collect(Collectors.toList());
        }
    }

    @Override
    public void deleteMeetingRoomById(int id) throws EntityNotFoundException {
        synchronized (meetingRoomById) {
            MeetingRoom meetingRoom = meetingRoomById.get(id);
            if (meetingRoom == null) {
                throw new EntityNotFoundException();
            }

            meetingRoomById.remove(id);
        }
    }

    @Override
    public int deleteEmptyMeetingRoomsThatHaveNotBeenUpdatedSince1min(Set<Integer> usedMeetingRoomIds) {
        ZonedDateTime now = ZonedDateTime.now();

        synchronized (meetingRoomById) {
            List<MeetingRoom> meetingRoomsToDelete = meetingRoomById.values().stream()
                    .filter(room -> !usedMeetingRoomIds.contains(room.getId()))
                    .filter(room -> Duration.between(room.getLastUpdateDateTime(), now).toMinutes() >= 1)
                    .collect(Collectors.toList());

            for (MeetingRoom room : meetingRoomsToDelete) {
                meetingRoomById.remove(room.getId());
            }

            return meetingRoomsToDelete.size();
        }
    }

    private MeetingRoom copy(MeetingRoom original) {
        return new MeetingRoom(
                original.getId(),
                original.getLastUpdateDateTime(),
                original.getName());
    }
}
