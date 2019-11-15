package fr.marcworld.webrtcdemo.onetoonevideocall.controllers;

import fr.marcworld.webrtcdemo.onetoonevideocall.dtos.ExitFromConferenceCallResponseCode;
import fr.marcworld.webrtcdemo.onetoonevideocall.dtos.StartConferenceResponseCode;
import fr.marcworld.webrtcdemo.onetoonevideocall.dtos.UserServerEvent;
import fr.marcworld.webrtcdemo.onetoonevideocall.dtos.UserServerEventCode;
import fr.marcworld.webrtcdemo.onetoonevideocall.entities.InactiveUserDeletionResult;
import fr.marcworld.webrtcdemo.onetoonevideocall.entities.User;
import fr.marcworld.webrtcdemo.onetoonevideocall.exceptions.UserAlreadyExistsException;
import fr.marcworld.webrtcdemo.onetoonevideocall.repositories.UserRepository;
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

        userRepository.startConferenceCall(callerUserId, otherUserId);

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
        if (user.getConferenceRoomNumber() == null) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ExitFromConferenceCallResponseCode.USER_NOT_IN_CONFERENCE_CALL);
        }

        // Warn all conference room members that the conference call is ended
        List<User> members = userRepository.findAllInConferenceRoomNumber(user.getConferenceRoomNumber());
        notifyToUsersThatConferenceCallsAreEnded(members);

        // Update the conference call users
        List<Integer> memberIds = members.stream()
                .map(User::getId)
                .collect(Collectors.toList());
        userRepository.exitFromConferenceCall(memberIds);

        notifyUsersUpdate();
        return ResponseEntity.ok(ExitFromConferenceCallResponseCode.SUCCESS);
    }

    @Scheduled(fixedDelay = 20000)
    public void purgeDisconnectedUsers() {
        // Send a heartbeat ping message to all users
        List<User> users = userRepository.findAll();
        for (User user : users) {
            messagingTemplate.convertAndSend(
                    "/topic/user-" + user.getId(),
                    new UserServerEvent(UserServerEventCode.HEARTBEAT_PING));
        }

        // Delete inactive users
        InactiveUserDeletionResult result = userRepository.deleteUsersInactiveForOneMinute();
        if (!result.getDeletedUsers().isEmpty()) {
            List<User> otherUsers = result.getOtherUsersInCancelledConferenceCalls();
            notifyToUsersThatConferenceCallsAreEnded(otherUsers);

            notifyUsersUpdate();
        }
    }

    @MessageMapping("/user-{userId}/heartbeat-pong")
    public void handleUserHeartbeatPong(@DestinationVariable int userId) {
        userRepository.markUserAsActive(userId);
    }

    private void notifyToUsersThatConferenceCallsAreEnded(List<User> users) {
        for (User user : users) {
            messagingTemplate.convertAndSend(
                    "/topic/user" + user.getId(),
                    new UserServerEvent(UserServerEventCode.CONFERENCE_CALL_ENDED));
        }
    }

    private void notifyUsersUpdate() {
        List<User> users = userRepository.findAll();
        messagingTemplate.convertAndSend("/topic/users", users);
    }
}