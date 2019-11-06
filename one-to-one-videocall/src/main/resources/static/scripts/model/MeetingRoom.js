import User from './User.js';

class MeetingRoom {

    /**
     * @param {{id: Number, lastUpdateDateTime: String, name: String, users: Array}} properties
     */
    static fromProperties(properties) {
        const userProperties = properties.users || [];
        const users = userProperties.map(userProperties => User.fromProperties(userProperties));

        return new MeetingRoom(
            properties.id,
            properties.lastUpdateDateTime,
            properties.name,
            users);
    }

    /**
     * @param {Number} id
     * @param {String} lastUpdateDateTime
     * @param {String} name
     * @param {User[]} users
     */
    constructor(id, lastUpdateDateTime, name, users) {
        this._id = id;
        this._lastUpdateDateTime = lastUpdateDateTime;
        this._name = name;
        this._users = users;
    }

    get id() {
        return this._id;
    }

    get lastUpdateDateTime() {
        return this._lastUpdateDateTime;
    }

    get name() {
        return this._name;
    }

    get users() {
        return this._users || [];
    }
}

export default MeetingRoom;