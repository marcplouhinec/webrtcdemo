class User {

    /**
     * @param {{
     *     id: Number,
     *     lastUpdateDateTime: String,
     *     name: String,
     *     conferenceRoomNumber: Number
     * }} properties
     */
    static fromProperties(properties) {
        return new User(
            properties.id,
            properties.lastUpdateDateTime,
            properties.name,
            properties.conferenceRoomNumber);
    }

    /**
     * @param {Number} id
     * @param {String} lastUpdateDateTime
     * @param {String} name
     * @param {Number} conferenceRoomNumber
     */
    constructor(id, lastUpdateDateTime, name, conferenceRoomNumber) {
        this._id = id;
        this._lastUpdateDateTime = lastUpdateDateTime;
        this._name = name;
        this._conferenceRoomNumber = conferenceRoomNumber;
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

    get conferenceRoomNumber() {
        return this._conferenceRoomNumber;
    }
}

export default User;