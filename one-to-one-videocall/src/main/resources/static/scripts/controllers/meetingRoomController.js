import meetingRoomService from '../services/meetingRoomService.js';
import MeetingRoomEventCode from '../model/MeetingRoomEventCode.js';

const meetingRoomController = {

    _username: '',

    /** @type {Number} */
    _enteredMeetingRoomId: null,

    async init() {
        // Load and display meeting rooms
        const meetingRooms = await meetingRoomService.findAllMeetingRooms();
        this._updateMeetingRooms(meetingRooms);

        meetingRoomService.subscribeToMeetingRoomUpdateEvent(meetingRooms => {
            this._updateMeetingRooms(meetingRooms);
        });

        // Create a meeting room
        const createMeetingRoomButton = document.getElementById('create-meeting-room');
        createMeetingRoomButton.addEventListener('click', () => {
            this._createMeetingRoom();
        });

        // Join or delete meeting rooms
        const bodyElement = document.getElementById('meeting-rooms-body');
        bodyElement.addEventListener('click', event => {
            const targetElement = /** @type {HTMLElement} */ event.target;

            if (targetElement.tagName.toLowerCase() !== 'button') {
                return;
            }

            const meetingRoomId = Number(targetElement.getAttribute('data-meeting-room-id'));

            if (targetElement.className === 'enter-meeting-room') {
                this._enterMeetingRoom(meetingRoomId, targetElement);
            } else if (targetElement.className === 'exit-meeting-room') {
                this._exitMeetingRoom(meetingRoomId, targetElement);
            } else if (targetElement.className === 'delete-meeting-room') {
                this._deleteMeetingRoom(meetingRoomId);
            }
        });
    },

    /**
     * @param {MeetingRoom[]} meetingRooms
     * @private
     */
    _updateMeetingRooms(meetingRooms) {
        const meetingRoomContents = meetingRooms.map(meetingRoom => {
            const isInRoom = this._username && meetingRoom.users.some(user => user.name === this._username);

            const mainButtonClass = isInRoom ? 'exit-meeting-room' : 'enter-meeting-room';
            const mainButtonText = isInRoom ? 'Exit' : 'Enter';

            return `<div class="meeting-room ${isInRoom ? 'active-meeting-room' : ''}">
                <div class="meeting-room-name">${meetingRoom.name} - ${meetingRoom.users.length} member(s)</div>
                <div class="meeting-room-enter">
                    <button class="${mainButtonClass}" data-meeting-room-id="${meetingRoom.id}">
                        ${mainButtonText}
                    </button>
                </div>
                <div class="meeting-room-delete">
                    <button class="delete-meeting-room" data-meeting-room-id="${meetingRoom.id}">Delete</button>
                </div>
            </div>`;
        });

        const meetingRoomsBodyElement = document.getElementById('meeting-rooms-body');
        if (meetingRoomContents.length > 0) {
            meetingRoomsBodyElement.innerHTML = meetingRoomContents.join('\n');
        } else {
            meetingRoomsBodyElement.innerHTML = `<div id="meeting-rooms-body-message">No meeting room</div>`;
        }
    },

    _createMeetingRoom() {
        const name = window.prompt('Meeting room name');

        if (name === undefined || name === null) {
            return;
        }

        if (typeof name !== 'string' || name.trim().length < 3) {
            alert('The meeting room name must have at least 3 characters.');
            return;
        }

        meetingRoomService.createMeetingRoomByName(name.trim());
    },

    /**
     * @param {Number} meetingRoomId
     * @private
     */
    async _deleteMeetingRoom(meetingRoomId) {
        if (!window.confirm('Are you sure you want to delete this meeting room?')) {
            return;
        }

        try {
            await meetingRoomService.deleteMeetingRoomById(meetingRoomId);
            alert('Meeting room deleted with success!');
        } catch (e) {
            alert(`Error: ${e.message}`);
        }
    },

    /**
     * @param {Number} meetingRoomId
     * @param {HTMLButtonElement} enterButton
     * @private
     */
    _enterMeetingRoom(meetingRoomId, enterButton) {
        if (this._enteredMeetingRoomId) {
            alert('Please exit from the current meeting room before entering into a new one.');
            return;
        }

        // Ask for a username if necessary
        if (!this._username) {
            const username = window.prompt('Please enter your username:');
            if (username === undefined || username === null) {
                return;
            }
            if (typeof username !== 'string' || username.trim().length < 3) {
                alert('The username must have at least 3 characters.');
                return;
            }
            this._username = username.trim();
        }

        // Subscribe to room events
        meetingRoomService.subscribeToMeetingRoomEvents(meetingRoomId, meetingRoomEvent => {
            switch (meetingRoomEvent.code) {
                case MeetingRoomEventCode.USER_HAS_ENTERED:
                    if (meetingRoomEvent.username !== this._username) {
                        break;
                    }
                    this._enteredMeetingRoomId = meetingRoomId;
                    enterButton.className = 'exit-meeting-room';
                    enterButton.textContent = 'Exit';
                    enterButton.disabled = false;
                    // TODO invoke conversationController
                    break;

                case MeetingRoomEventCode.USER_HAS_EXITED:
                    if (meetingRoomEvent.username !== this._username) {
                        break;
                    }
                    this._enteredMeetingRoomId = null;
                    enterButton.className = 'enter-meeting-room';
                    enterButton.textContent = 'Enter';
                    enterButton.disabled = false;
                    // TODO invoke conversationController
                    break;

                case MeetingRoomEventCode.USER_REJECTED_BECAUSE_ROOM_FULL:
                    if (meetingRoomEvent.username !== this._username) {
                        break;
                    }
                    meetingRoomService.unsubscribeFromMeetingRoomEvents(meetingRoomId);
                    enterButton.disabled = false;
                    alert('Error: unable to enter into this room because it is full.');
                    break;

                case MeetingRoomEventCode.USERNAME_ALREADY_EXIST:
                    if (meetingRoomEvent.username !== this._username || this._enteredMeetingRoomId) {
                        break;
                    }
                    meetingRoomService.unsubscribeFromMeetingRoomEvents(meetingRoomId);
                    this._username = null;
                    enterButton.disabled = false;
                    alert('Error: unable to enter into this room because another user with the ' +
                        'same name already exists.');
                    break;

                case MeetingRoomEventCode.USER_HEARTBEAT_PING:
                    if (meetingRoomEvent.username !== this._username) {
                        break;
                    }
                    meetingRoomService.notifyUserIsInMeetingRoom(meetingRoomId, this._username);
                    break;
            }
        });

        // Try to enter into the room
        enterButton.disabled = true;
        meetingRoomService.enterIntoMeetingRoom(meetingRoomId, this._username);
    },

    /**
     * @param {Number} meetingRoomId
     * @param {HTMLButtonElement} exitButton
     * @private
     */
    _exitMeetingRoom(meetingRoomId, exitButton) {
        if (this._enteredMeetingRoomId !== meetingRoomId) {
            alert('Error: you are not in this room.');
            return;
        }

        exitButton.disabled = true;
        meetingRoomService.exitFromMeetingRoom(meetingRoomId, this._username);
    }
};

export default meetingRoomController;