package fr.marcworld.webrtcdemo.onetoonevideocall.controllers;

import fr.marcworld.webrtcdemo.onetoonevideocall.dtos.MeetingRoomDTO;
import fr.marcworld.webrtcdemo.onetoonevideocall.dtos.MeetingRoomEvent;
import fr.marcworld.webrtcdemo.onetoonevideocall.dtos.MeetingRoomEventCode;
import fr.marcworld.webrtcdemo.onetoonevideocall.dtos.MeetingRoomResponseCode;
import fr.marcworld.webrtcdemo.onetoonevideocall.entities.MeetingRoom;
import fr.marcworld.webrtcdemo.onetoonevideocall.entities.User;
import fr.marcworld.webrtcdemo.onetoonevideocall.exceptions.EntityNotFoundException;
import fr.marcworld.webrtcdemo.onetoonevideocall.exceptions.MeetingRoomFullException;
import fr.marcworld.webrtcdemo.onetoonevideocall.exceptions.UserAlreadyExistsException;
import fr.marcworld.webrtcdemo.onetoonevideocall.repositories.MeetingRoomRepository;
import fr.marcworld.webrtcdemo.onetoonevideocall.repositories.UserRepository;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@RestController
public class MeetingRoomController {

    private final MeetingRoomRepository meetingRoomRepository;
    private final UserRepository userRepository;

    private final SimpMessagingTemplate messagingTemplate;
    private final Executor executor = Executors.newSingleThreadExecutor();

    public MeetingRoomController(MeetingRoomRepository meetingRoomRepository,
                                 UserRepository userRepository,
                                 SimpMessagingTemplate messagingTemplate) {
        this.meetingRoomRepository = meetingRoomRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @RequestMapping(value = "/meeting-rooms", method = RequestMethod.POST)
    public MeetingRoom createMeetingRoom(@RequestBody MeetingRoom meetingRoom) {
        MeetingRoom createdMeetingRoom = meetingRoomRepository.create(meetingRoom);
        publishMeetingRoomsUpdate();
        return createdMeetingRoom;
    }

    @RequestMapping(value = "/meeting-rooms", method = RequestMethod.GET)
    public List<MeetingRoomDTO> findAllMeetingRooms() {
        List<MeetingRoom> meetingRooms = meetingRoomRepository.findAll();
        List<User> users = userRepository.findAllWhereMeetingRoomIdIsNotNull();
        return convertToMeetingRoomDTOs(meetingRooms, users);
    }

    @RequestMapping(value = "/meeting-rooms/{meetingRoomId}", method = RequestMethod.DELETE)
    public MeetingRoomResponseCode deleteMeetingRoomById(@PathVariable int meetingRoomId) {
        // Check that the room is not empty
        long nbUsers = userRepository.countByMeetingRoomId(meetingRoomId);
        if (nbUsers > 0) {
            return MeetingRoomResponseCode.MEETING_ROOM_NOT_EMPTY;
        }

        // Delete the meeting room
        try {
            meetingRoomRepository.deleteMeetingRoomById(meetingRoomId);
            publishMeetingRoomsUpdate();
            return MeetingRoomResponseCode.SUCCESS;
        } catch (EntityNotFoundException e) {
            return MeetingRoomResponseCode.UNKNOWN_MEETING_ROOM_ID;
        }
    }

    @MessageMapping("/meeting-room-{meetingRoomId}/ENTER_INTO_MEETING_ROOM")
    @SendTo("/topic/meeting-room-{meetingRoomId}")
    public MeetingRoomEvent enterIntoMeetingRoom(@DestinationVariable int meetingRoomId, MeetingRoomEvent inputEvent) {
        String username = inputEvent.getUsername();

        // Register the user (he will be deleted when he will exit from the room)
        User user;
        try {
            user = userRepository.create(new User(username));
        } catch (UserAlreadyExistsException e) {
            return new MeetingRoomEvent(
                    MeetingRoomEventCode.USERNAME_ALREADY_EXIST,
                    meetingRoomId,
                    username);
        }

        // Check the meeting room exists
        MeetingRoom meetingRoom = meetingRoomRepository.findById(meetingRoomId);
        if (meetingRoom == null) {
            return new MeetingRoomEvent(
                    MeetingRoomEventCode.UNKNOWN_MEETING_ROOM,
                    meetingRoomId,
                    username);
        }

        // Enter in the room
        try {
            userRepository.enterIntoMeetingRoom(user.getId(), meetingRoomId);
        } catch (MeetingRoomFullException e) {
            return new MeetingRoomEvent(
                    MeetingRoomEventCode.USER_REJECTED_BECAUSE_ROOM_FULL,
                    meetingRoomId,
                    username);
        } catch (EntityNotFoundException e) {
            return new MeetingRoomEvent(
                    MeetingRoomEventCode.UNKNOWN_USER,
                    meetingRoomId,
                    username);
        }

        publishMeetingRoomsUpdate();

        return new MeetingRoomEvent(
                MeetingRoomEventCode.USER_HAS_ENTERED,
                meetingRoomId,
                username);
    }

    @MessageMapping("/meeting-room-{meetingRoomId}/EXIT_FROM_MEETING_ROOM")
    @SendTo("/topic/meeting-room-{meetingRoomId}")
    public MeetingRoomEvent exitFromMeetingRoom(@DestinationVariable int meetingRoomId, MeetingRoomEvent inputEvent) {
        String username = inputEvent.getUsername();

        // Check the meeting room exists
        MeetingRoom meetingRoom = meetingRoomRepository.findById(meetingRoomId);
        if (meetingRoom == null) {
            return new MeetingRoomEvent(
                    MeetingRoomEventCode.UNKNOWN_MEETING_ROOM,
                    meetingRoomId,
                    username);
        }

        // Find the user
        User user = userRepository.findByName(username);
        if (user == null) {
            return new MeetingRoomEvent(
                    MeetingRoomEventCode.UNKNOWN_USER,
                    meetingRoomId,
                    username);
        }

        // Delete the user (it also removes him from the room automatically)
        userRepository.deleteById(user.getId());

        publishMeetingRoomsUpdate();

        return new MeetingRoomEvent(
                MeetingRoomEventCode.USER_HAS_EXITED,
                meetingRoomId,
                username);
    }

    @MessageMapping("/meeting-room-{meetingRoomId}/USER_HEARTBEAT_PONG")
    public void handleUserHeartbeatPong(@DestinationVariable int meetingRoomId, MeetingRoomEvent inputEvent) {
        // TODO
    }

    // TODO send pings

    @Scheduled(fixedDelay = 30000)
    public void purgeEmptyMeetingRooms() {
        Set<Integer> usedMeetingRoomIds = userRepository.findUsedMeetingRoomIds();

        int nbDeletedRooms = meetingRoomRepository
                .deleteEmptyMeetingRoomsThatHaveNotBeenUpdatedSince1min(usedMeetingRoomIds);
        if (nbDeletedRooms > 0) {
            publishMeetingRoomsUpdate();
        }
    }

    private void publishMeetingRoomsUpdate() {
        executor.execute(() -> {
            List<MeetingRoomDTO> meetingRoomDTOs = findAllMeetingRooms();
            messagingTemplate.convertAndSend("/topic/meeting-rooms", meetingRoomDTOs);
        });
    }

    private List<MeetingRoomDTO> convertToMeetingRoomDTOs(List<MeetingRoom> meetingRooms, List<User> users) {
        Map<Integer, List<User>> usersByMeetingRoomId = users.stream()
                .collect(Collectors.groupingBy(User::getMeetingRoomId));

        return meetingRooms.stream()
                .map(it -> {
                    List<User> roomUsers = usersByMeetingRoomId.get(it.getId());

                    return new MeetingRoomDTO(
                            it.getId(),
                            it.getLastUpdateDateTime(),
                            it.getName(),
                            roomUsers == null ? Collections.emptyList() : roomUsers);
                })
                .collect(Collectors.toList());
    }
}
