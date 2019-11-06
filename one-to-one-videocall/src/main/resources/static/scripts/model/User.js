class User {

    /**
     * @param {{id: Number, lastUpdateDateTime: String, name: String, meetingRoomId: Number}} properties
     */
    static fromProperties(properties) {
        return new User(
            properties.id,
            properties.lastUpdateDateTime,
            properties.name,
            properties.meetingRoomId);
    }

    /**
     * @param {Number} id
     * @param {String} lastUpdateDateTime
     * @param {String} name
     * @param {Number} meetingRoomId
     */
    constructor(id, lastUpdateDateTime, name, meetingRoomId) {
        this._id = id;
        this._lastUpdateDateTime = lastUpdateDateTime;
        this._name = name;
        this._meetingRoomId = meetingRoomId;
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

    get meetingRoomId() {
        return this._meetingRoomId;
    }
}

export default User;