package fr.marcworld.webrtcdemo.onetoonevideocall.repositories.impl;

import fr.marcworld.webrtcdemo.onetoonevideocall.entities.User;
import fr.marcworld.webrtcdemo.onetoonevideocall.exceptions.EntityNotFoundException;
import fr.marcworld.webrtcdemo.onetoonevideocall.exceptions.MeetingRoomFullException;
import fr.marcworld.webrtcdemo.onetoonevideocall.exceptions.UserAlreadyExistsException;
import fr.marcworld.webrtcdemo.onetoonevideocall.repositories.UserRepository;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
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
