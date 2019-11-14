import User from '../model/User.js'
import userService from '../services/userService.js'

const usersPanelController = {

    /** @type {User} */
    _user: null,

    async init() {
        // Register a new user
        this._user = await this._registerNewUser();
        userService.subscribeToUserEvents(this._user.id, event => {
            // TODO
            console.log('user event: ' + JSON.stringify(event))
        });

        // Load the users and display them
        const users = await userService.findAllUsers();
        this._updatePanel(users);
        userService.subscribeToUsersUpdateEvent(users => {
            this._updatePanel(users);
        });

        // Handle call events
        const usersBodyElement = document.getElementById('users-body');
        usersBodyElement.addEventListener('click', event => {
            const targetElement = /** @type {HTMLElement} */ event.target;

            if (targetElement.tagName.toLowerCase() !== 'button' || targetElement.className !== 'call-button') {
                return;
            }
            const userId = targetElement.getAttribute('data-user-id');

            // TODO
            console.log('call ' + userId);
        });
    },

    /**
     * @param {User[]} users
     * @private
     */
    _updatePanel(users) {
        const usersBodyElement = document.getElementById('users-body');

        if (users.length === 0) {
            usersBodyElement.innerHTML = `<div id="users-body-message">No user</div>`;
            return;
        }

        // Group users by conference room
        const usersByRoomNumber = users.reduce(
            (map, user) => {
                const roomNumber = user.meetingRoomId || -1;
                if (map.has(roomNumber)) {
                    map.get(roomNumber).push(user);
                } else {
                    map.set(roomNumber, [user]);
                }
                return map;
            },
            new Map()
        );

        // Generate HTML content
        const sortedRoomNumbers = [...usersByRoomNumber.keys()].sort((a, b) => a - b);
        const roomsHtmlContent = sortedRoomNumbers
            .map(roomNumber => {
                const roomName = roomNumber === -1 ? 'Available users' : `Room ${roomNumber}`;

                const roomUsers = usersByRoomNumber.get(roomNumber);
                const usersHtmlContent = roomUsers
                    .map(user => {
                        const isCurrentUser = this._user.id === user.id;

                        return `
                            <li class="user ${isCurrentUser ? 'current-user' : ''}">
                                <div class="user-name">${user.name} ${isCurrentUser ? '(you)' : ''}</div>
                                <button class="call-button" 
                                        data-user-id="${user.id}"
                                        ${isCurrentUser ? 'disabled' : ''}>
                                    Call
                                </button>
                            </li>`;
                    })
                    .join('\n');

                return `
                    <li>
                        ▾ ${roomName}
                        <ul class="room-users">${usersHtmlContent}</ul>
                    </li>`;
            })
            .join('\n');
        usersBodyElement.innerHTML = `<ul class="conference-rooms">${roomsHtmlContent}</ul>`;
    },

    /**
     * @return {Promise<User>}
     * @private
     */
    async _registerNewUser() {
        let user = null;

        while (!user) {
            // Prompt for a user name
            let userName = '';
            do {
                userName = window.prompt('Please enter your name (≥ 3 characters)');
                if (!userName || userName.trim().length < 3) {
                    alert('The name must have at least 3 characters.');
                    userName = null;
                }
            } while (!userName);

            // Create the user
            try {
                user = await userService.createUser(new User(null, null, userName, -1));
            } catch (e) {
                alert(`Error: ${e.message}`);
            }
        }

        return user;
    }
};

export default usersPanelController;