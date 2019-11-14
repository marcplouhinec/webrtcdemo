package fr.marcworld.webrtcdemo.onetoonevideocall.repositories.impl;

import fr.marcworld.webrtcdemo.onetoonevideocall.entities.InactiveUserDeletionResult;
import fr.marcworld.webrtcdemo.onetoonevideocall.entities.User;
import fr.marcworld.webrtcdemo.onetoonevideocall.exceptions.EntityNotFoundException;
import fr.marcworld.webrtcdemo.onetoonevideocall.exceptions.MeetingRoomFullException;
import fr.marcworld.webrtcdemo.onetoonevideocall.exceptions.UserAlreadyExistsException;
import fr.marcworld.webrtcdemo.onetoonevideocall.repositories.UserRepository;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Repository
public class InMemoryUserRepositoryImpl implements UserRepository {

    private final Map<Integer, User> userById = new TreeMap<>();
    private final AtomicInteger nextId = new AtomicInteger();

    @Override
    public User create(User user) throws UserAlreadyExistsException {
        synchronized (userById) {
            // Check the name is unique
            boolean duplicatedName = userById.values().stream()
                    .anyMatch(it -> it.getName().equals(user.getName()));
            if (duplicatedName) {
                throw new UserAlreadyExistsException();
            }

            // Add the new user
            User newUser = new User();
            newUser.setId(nextId.getAndIncrement());
            newUser.setName(user.getName());
            newUser.setLastUpdateDateTime(ZonedDateTime.now());
            userById.put(newUser.getId(), newUser);

            return copy(newUser);
        }
    }

    @Override
    public List<User> findAll() {
        synchronized (userById) {
            return userById.values().stream()
                    .map(this::copy)
                    .collect(Collectors.toList());
        }
    }

    @Override
    public User findById(int userId) {
        synchronized (userById) {
            User user = userById.get(userId);
            if (user == null) {
                return null;
            }
            return copy(user);
        }
    }

    @Override
    public void startConferenceCall(int callerUserId, int otherUserId) {
        synchronized (userById) {
            OptionalInt maxRoomNumber = userById.values().stream()
                    .mapToInt(User::getMeetingRoomId)
                    .max();
            int newRoomNumber = maxRoomNumber.orElse(0) + 1;


            User callerUser = userById.get(callerUserId);
            User otherUser = userById.get(otherUserId);
            callerUser.setMeetingRoomId(newRoomNumber);
            otherUser.setMeetingRoomId(newRoomNumber);

            callerUser.setLastUpdateDateTime(ZonedDateTime.now());
            otherUser.setLastUpdateDateTime(ZonedDateTime.now());
        }
    }

    @Override
    public List<User> findAllInConferenceRoomNumber(int conferenceRoomNumber) {
        synchronized (userById) {
            return userById.values().stream()
                    .filter(it -> it.getMeetingRoomId() != null)
                    .filter(it -> it.getMeetingRoomId() == conferenceRoomNumber)
                    .map(this::copy)
                    .collect(Collectors.toList());
        }
    }

    @Override
    public void exitFromConferenceCall(List<Integer> userIds) {
        synchronized (userById) {
            for (Integer userId : userIds) {
                User user = userById.get(userId);
                if (user != null) {
                    user.setMeetingRoomId(null);
                    user.setLastUpdateDateTime(ZonedDateTime.now());
                }
            }
        }
    }

    @Override
    public InactiveUserDeletionResult deleteUsersInactiveForOneMinute() {
        ZonedDateTime oneMinAgo = ZonedDateTime.now().minus(1, ChronoUnit.MINUTES);

        synchronized (userById) {
            // Find the users to delete
            Set<User> inactiveUsers = userById.values().stream()
                    .filter(it -> it.getLastUpdateDateTime().isBefore(oneMinAgo))
                    .map(this::copy)
                    .collect(Collectors.toSet());

            // Find the impacted conference rooms
            Set<Integer> conferenceRoomNumbers = inactiveUsers.stream()
                    .map(User::getMeetingRoomId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            // Find the users who are in a conference call with the users to delete
            List<User> impactedUsers = userById.values().stream()
                    .filter(it -> it.getMeetingRoomId() != null)
                    .filter(it -> conferenceRoomNumbers.contains(it.getMeetingRoomId()))
                    .filter(inactiveUsers::contains)
                    .collect(Collectors.toList());

            // Cancel the conference calls of the impacted users
            List<Integer> impactedUserIds = impactedUsers.stream()
                    .map(User::getId)
                    .collect(Collectors.toList());
            exitFromConferenceCall(impactedUserIds);

            // Delete the inactive users
            for (User inactiveUser : inactiveUsers) {
                userById.remove(inactiveUser.getId());
            }

            List<User> sortedInactiveUsers = inactiveUsers.stream()
                    .sorted(Comparator.comparing(User::getId))
                    .collect(Collectors.toList());
            List<User> copiedImpactedUsers = impactedUsers.stream()
                    .map(this::copy)
                    .collect(Collectors.toList());
            return new InactiveUserDeletionResult(
                    sortedInactiveUsers,
                    new ArrayList<>(conferenceRoomNumbers),
                    copiedImpactedUsers);
        }
    }

    @Override
    public void markUserAsActive(int userId) {
        synchronized (userById) {
            User user = userById.get(userId);
            if (user != null) {
                user.setLastUpdateDateTime(ZonedDateTime.now());
            }
        }
    }

    @Override
    public List<User> findAllWhereMeetingRoomIdIsNotNull() {
        synchronized (userById) {
            return userById.values().stream()
                    .filter(it -> it.getMeetingRoomId() != null)
                    .map(this::copy)
                    .collect(Collectors.toList());
        }
    }

    @Override
    public User findByName(String name) {
        synchronized (userById) {
            return userById.values().stream()
                    .filter(it -> it.getName().equals(name))
                    .findAny()
                    .orElse(null);
        }
    }

    @Override
    public long countByMeetingRoomId(int meetingRoomId) {
        synchronized (userById) {
            return userById.values().stream()
                    .filter(it -> it.getMeetingRoomId() != null)
                    .filter(it -> it.getMeetingRoomId() == meetingRoomId)
                    .count();
        }
    }

    @Override
    public User deleteById(int userId) {
        synchronized (userById) {
            return userById.remove(userId);
        }
    }

    @Override
    public void enterIntoMeetingRoom(int userId, int meetingRoomId)
            throws EntityNotFoundException, MeetingRoomFullException {
        synchronized (userById) {
            // Make sur the room is not full
            long nbUsersInRoom = userById.values().stream()
                    .filter(it -> it.getMeetingRoomId() != null)
                    .filter(it -> it.getMeetingRoomId() == meetingRoomId)
                    .count();
            if (nbUsersInRoom >= 2) {
                throw new MeetingRoomFullException();
            }

            // Update the user
            User user = userById.get(userId);
            if (user == null) {
                throw new EntityNotFoundException();
            }
            user.setMeetingRoomId(meetingRoomId);
            user.setLastUpdateDateTime(ZonedDateTime.now());
        }
    }

    @Override
    public Set<Integer> findUsedMeetingRoomIds() {
        synchronized (userById) {
            return userById.values().stream()
                    .map(User::getMeetingRoomId)
                    .collect(Collectors.toSet());
        }
    }

    private User copy(User original) {
        return new User(
                original.getId(),
                original.getLastUpdateDateTime(),
                original.getName(),
                original.getMeetingRoomId());
    }
}
