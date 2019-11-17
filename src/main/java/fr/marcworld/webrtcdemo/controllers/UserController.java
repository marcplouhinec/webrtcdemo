package fr.marcworld.webrtcdemo.controllers;

import fr.marcworld.webrtcdemo.dtos.*;
import fr.marcworld.webrtcdemo.entities.InactiveUserDeletionResult;
import fr.marcworld.webrtcdemo.entities.User;
import fr.marcworld.webrtcdemo.exceptions.UserAlreadyExistsException;
import fr.marcworld.webrtcdemo.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
public class UserController {

    private static final Logger LOGGER = LoggerFactory.getLogger(UserController.class);

    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public UserController(UserRepository userRepository, SimpMessagingTemplate messagingTemplate) {
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @RequestMapping(value = "/users", method = RequestMethod.POST)
    public ResponseEntity<User> createUser(@RequestBody User user) {
        try {
            User createdUser = userRepository.create(user);
            LOGGER.info("User {} created.", createdUser);
            notifyUsersUpdate();
            return ResponseEntity.ok(createdUser);
        } catch (UserAlreadyExistsException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @RequestMapping(value = "/users", method = RequestMethod.GET)
    public List<User> findAllUser() {
        return userRepository.findAll();
    }

    @RequestMapping(value = "/users/{id}", method = RequestMethod.GET)
    public ResponseEntity<User> findUserById(@PathVariable int id) {
        User user = userRepository.findById(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    @RequestMapping(value = "/users/{callerUserId}/start-conference-call", method = RequestMethod.POST)
    public ResponseEntity<StartConferenceResponseCode> startConferenceCall(
            @PathVariable int callerUserId,
            @RequestBody int otherUserId) {

        User callerUser = userRepository.findById(callerUserId);
        if (callerUser == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(StartConferenceResponseCode.UNKNOWN_CALLER_USER_ID);
        }

        if (callerUser.getConferenceRoomNumber() != null) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(StartConferenceResponseCode.CALLER_USER_ALREADY_IN_CONFERENCE);
        }

        User otherUser = userRepository.findById(otherUserId);
        if (otherUser == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(StartConferenceResponseCode.UNKNOWN_OTHER_USER_ID);
        }

        if (otherUser.getConferenceRoomNumber() != null) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(StartConferenceResponseCode.OTHER_USER_ALREADY_IN_CONFERENCE);
        }

        List<User> users = userRepository.startConferenceCall(callerUserId, otherUserId);
        Integer roomNumber = users.get(0).getConferenceRoomNumber();
        LOGGER.info("Conference call started with the users {} (room number: {}).", users, roomNumber);

        sendEventToUsers(
                new UserServerEvent<>(
                        UserServerEventCode.CONFERENCE_CALL_STARTED,
                        new ConferenceCall(callerUserId, otherUserId, roomNumber)),
                users);
        notifyUsersUpdate();
        return ResponseEntity.ok(StartConferenceResponseCode.SUCCESS);
    }

    @RequestMapping(value = "/users/{userId}/exit-from-conference-call", method = RequestMethod.POST)
    public ResponseEntity<ExitFromConferenceCallResponseCode> exitFromConferenceCall(@PathVariable int userId) {
        User user = userRepository.findById(userId);
        if (user == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ExitFromConferenceCallResponseCode.UNKNOWN_USER_ID);
        }
        Integer roomNumber = user.getConferenceRoomNumber();
        if (roomNumber == null) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ExitFromConferenceCallResponseCode.USER_NOT_IN_CONFERENCE_CALL);
        }

        // Warn all conference room members that the conference call is ended
        List<User> members = userRepository.findAllInConferenceRoomNumber(roomNumber);
        sendEventToUsers(new UserServerEvent(UserServerEventCode.CONFERENCE_CALL_ENDED), members);

        // Update the conference call users
        List<Integer> memberIds = members.stream()
                .map(User::getId)
                .collect(Collectors.toList());
        userRepository.exitFromConferenceCall(memberIds);

        LOGGER.info("Conference call ended (users: {}, room number: {}).", members, roomNumber);
        notifyUsersUpdate();
        return ResponseEntity.ok(ExitFromConferenceCallResponseCode.SUCCESS);
    }

    @Scheduled(fixedDelay = 10000)
    public void purgeDisconnectedUsers() {
        // Send a heartbeat ping message to all users
        List<User> users = userRepository.findAll();
        for (User user : users) {
            messagingTemplate.convertAndSend(
                    "/topic/user-" + user.getId(),
                    new UserServerEvent(UserServerEventCode.HEARTBEAT_PING));
        }

        // Delete inactive users
        InactiveUserDeletionResult result = userRepository.deleteUsersInactiveForTwentySeconds();
        if (!result.getDeletedUsers().isEmpty()) {
            List<User> otherUsers = result.getOtherUsersInCancelledConferenceCalls();
            sendEventToUsers(new UserServerEvent(UserServerEventCode.CONFERENCE_CALL_ENDED), otherUsers);

            LOGGER.info("Inactive users purged: {}. " +
                            "Cancelled conference room numbers: {}. " +
                            "Impacted active users: {}.",
                    result.getDeletedUsers(), result.getCancelledConferenceRoomNumbers(), otherUsers);
            notifyUsersUpdate();
        }
    }

    @MessageMapping("/user-{userId}/heartbeat-pong")
    public void handleUserHeartbeatPong(@DestinationVariable int userId) {
        userRepository.markUserAsActive(userId);
    }

    @MessageMapping("/user-{userId}/forward-message-to-{otherUserId}")
    public void forwardMessage(
            @DestinationVariable int userId,
            @DestinationVariable int otherUserId,
            PeerMessage peerMessage) {

        LOGGER.info("Forward a message from the users {} to {}: {}", userId, otherUserId, peerMessage);

        messagingTemplate.convertAndSend(
                "/topic/user-" + otherUserId,
                new UserServerEvent<>(UserServerEventCode.PEER_MESSAGE_SENT, peerMessage));
    }

    private void sendEventToUsers(UserServerEvent event, List<User> users) {
        for (User user : users) {
            messagingTemplate.convertAndSend("/topic/user-" + user.getId(), event);
        }
    }

    private void notifyUsersUpdate() {
        List<User> users = userRepository.findAll();
        messagingTemplate.convertAndSend("/topic/users", users);
    }
}