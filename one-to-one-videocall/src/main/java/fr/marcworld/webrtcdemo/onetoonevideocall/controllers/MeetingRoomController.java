package fr.marcworld.webrtcdemo.onetoonevideocall.controllers;

import fr.marcworld.webrtcdemo.onetoonevideocall.exceptions.MeetingRoomFullException;
import fr.marcworld.webrtcdemo.onetoonevideocall.exceptions.MeetingRoomNotEmptyException;
import fr.marcworld.webrtcdemo.onetoonevideocall.exceptions.UserAlreadyExistsException;
import fr.marcworld.webrtcdemo.onetoonevideocall.model.MeetingRoom;
import fr.marcworld.webrtcdemo.onetoonevideocall.model.MeetingRoomEvent;
import fr.marcworld.webrtcdemo.onetoonevideocall.model.MeetingRoomEventCode;
import fr.marcworld.webrtcdemo.onetoonevideocall.model.MeetingRoomResponseCode;
import fr.marcworld.webrtcdemo.onetoonevideocall.repositories.MeetingRoomRepository;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

@RestController
public class MeetingRoomController {

    private final MeetingRoomRepository meetingRoomRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final Executor executor = Executors.newSingleThreadExecutor();

    public MeetingRoomController(MeetingRoomRepository meetingRoomRepository,
                                 SimpMessagingTemplate messagingTemplate) {
        this.meetingRoomRepository = meetingRoomRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @RequestMapping(value = "/meeting-rooms", method = RequestMethod.POST)
    public MeetingRoom createMeetingRoom(@RequestBody MeetingRoom meetingRoom) {
        MeetingRoom createdMeetingRoom = meetingRoomRepository.create(meetingRoom);
        publishMeetingRoomsUpdate();
        return createdMeetingRoom;
    }

    @RequestMapping(value = "/meeting-rooms", method = RequestMethod.GET)
    public List<MeetingRoom> findAllMeetingRooms() {
        return meetingRoomRepository.findAll();
    }

    @RequestMapping(value = "/meeting-rooms/{meetingRoomId}", method = RequestMethod.DELETE)
    public MeetingRoomResponseCode deleteMeetingRoomById(@PathVariable int meetingRoomId) {
        try {
            meetingRoomRepository.deleteMeetingRoomById(meetingRoomId);
            publishMeetingRoomsUpdate();
            return MeetingRoomResponseCode.SUCCESS;
        } catch (MeetingRoomNotEmptyException e) {
            return MeetingRoomResponseCode.MEETING_ROOM_NOT_EMPTY;
        } catch (IllegalArgumentException e) {
            return MeetingRoomResponseCode.UNKNOWN_MEETING_ROOM_ID;
        }
    }

    @MessageMapping("/meeting-room-{meetingRoomId}/ENTER_INTO_MEETING_ROOM")
    @SendTo("/topic/meeting-room-{meetingRoomId}")
    public MeetingRoomEvent enterIntoMeetingRoom(@DestinationVariable int meetingRoomId, MeetingRoomEvent inputEvent) {
        String username = inputEvent.getUsername();

        try {
            meetingRoomRepository.addUserToMeetingRoom(meetingRoomId, username);

            publishMeetingRoomsUpdate();

            return new MeetingRoomEvent(
                    MeetingRoomEventCode.USER_HAS_ENTERED,
                    meetingRoomId,
                    username);
        } catch (MeetingRoomFullException e) {
            return new MeetingRoomEvent(
                    MeetingRoomEventCode.USER_REJECTED_BECAUSE_ROOM_FULL,
                    meetingRoomId,
                    username);
        } catch (UserAlreadyExistsException e) {
            return new MeetingRoomEvent(
                    MeetingRoomEventCode.USERNAME_ALREADY_EXIST,
                    meetingRoomId,
                    username);
        } catch (IllegalArgumentException e) {
            return new MeetingRoomEvent(
                    MeetingRoomEventCode.UNKNOWN_MEETING_ROOM,
                    meetingRoomId,
                    username);
        }
    }

    @MessageMapping("/meeting-room-{meetingRoomId}/EXIT_FROM_MEETING_ROOM")
    @SendTo("/topic/meeting-room-{meetingRoomId}")
    public MeetingRoomEvent exitFromMeetingRoom(@DestinationVariable int meetingRoomId, MeetingRoomEvent inputEvent) {
        String username = inputEvent.getUsername();

        try {
            meetingRoomRepository.removeUserFromMeetingRoom(meetingRoomId, username);

            publishMeetingRoomsUpdate();

            return new MeetingRoomEvent(
                    MeetingRoomEventCode.USER_HAS_EXITED,
                    meetingRoomId,
                    username);
        } catch (IllegalArgumentException e) {
            return new MeetingRoomEvent(
                    MeetingRoomEventCode.UNKNOWN_MEETING_ROOM,
                    meetingRoomId,
                    username);
        }
    }

    @MessageMapping("/meeting-room-{meetingRoomId}/USER_HEARTBEAT_PONG")
    public void handleUserHeartbeatPong(@DestinationVariable int meetingRoomId, MeetingRoomEvent inputEvent) {
        // TODO
    }

    private void publishMeetingRoomsUpdate() {
        executor.execute(() -> {
            List<MeetingRoom> meetingRooms = meetingRoomRepository.findAll();
            messagingTemplate.convertAndSend("/topic/meeting-rooms", meetingRooms);
        });
    }

    // TODO send pings
}
