package fr.marcworld.webrtcdemo.onetoonevideocall.repositories.impl;

import fr.marcworld.webrtcdemo.onetoonevideocall.exceptions.MeetingRoomFullException;
import fr.marcworld.webrtcdemo.onetoonevideocall.exceptions.MeetingRoomNotEmptyException;
import fr.marcworld.webrtcdemo.onetoonevideocall.exceptions.UserAlreadyExistsException;
import fr.marcworld.webrtcdemo.onetoonevideocall.model.MeetingRoom;
import fr.marcworld.webrtcdemo.onetoonevideocall.repositories.MeetingRoomRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class InMemoryMeetingRoomRepositoryImpl implements MeetingRoomRepository {

    private final Map<Integer, MeetingRoom> meetingRoomById = new TreeMap<>();
    private final AtomicInteger nextId = new AtomicInteger();

    @Override
    public MeetingRoom create(MeetingRoom meetingRoom) {
        meetingRoom.setId(nextId.getAndIncrement());
        meetingRoom.setCreationDateTime(ZonedDateTime.now());
        meetingRoom.setLastUpdateDateTime(ZonedDateTime.now());
        meetingRoom.setUsernames(new ArrayList<>());
        synchronized (meetingRoomById) {
            meetingRoomById.put(meetingRoom.getId(), meetingRoom);
        }
        return meetingRoom;
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
    public void deleteMeetingRoomById(int id) throws MeetingRoomNotEmptyException {
        synchronized (meetingRoomById) {
            MeetingRoom meetingRoom = meetingRoomById.get(id);
            if (meetingRoom == null) {
                throw new IllegalArgumentException("Unknown meeting room ID");
            }

            if (!meetingRoom.getUsernames().isEmpty()) {
                throw new MeetingRoomNotEmptyException();
            }

            meetingRoomById.remove(id);
        }
    }

    @Override
    public MeetingRoom addUserToMeetingRoom(int id, String username)
            throws MeetingRoomFullException, UserAlreadyExistsException {

        synchronized (meetingRoomById) {
            MeetingRoom meetingRoom = meetingRoomById.get(id);

            if (meetingRoom == null) {
                throw new IllegalArgumentException("Unknown meeting room ID");
            }
            if (meetingRoom.getUsernames().size() >= 2) {
                throw new MeetingRoomFullException();
            }

            // Check if the username is unique across meeting rooms
            boolean usernameAlreadyExists = meetingRoomById.values().stream()
                    .flatMap(room -> room.getUsernames().stream())
                    .anyMatch(roomUsername -> roomUsername.equals(username));
            if (usernameAlreadyExists) {
                throw new UserAlreadyExistsException();
            }

            meetingRoom.getUsernames().add(username);
            meetingRoom.setLastUpdateDateTime(ZonedDateTime.now());

            return copy(meetingRoom);
        }
    }

    @Override
    public MeetingRoom removeUserFromMeetingRoom(int id, String username) {
        synchronized (meetingRoomById) {
            MeetingRoom meetingRoom = meetingRoomById.get(id);

            if (meetingRoom == null) {
                throw new IllegalArgumentException("Unknown meeting room ID");
            }

            meetingRoom.getUsernames().remove(username);
            meetingRoom.setLastUpdateDateTime(ZonedDateTime.now());

            return copy(meetingRoom);
        }
    }

    @Override
    public int deleteEmptyMeetingRoomsThatHaveNotBeenUpdatedSince1min() {
        ZonedDateTime now = ZonedDateTime.now();

        synchronized (meetingRoomById) {
            List<MeetingRoom> meetingRoomsToDelete = meetingRoomById.values().stream()
                    .filter(room -> room.getUsernames().isEmpty())
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
                original.getCreationDateTime(),
                original.getLastUpdateDateTime(),
                original.getName(),
                original.getUsernames());
    }
}
