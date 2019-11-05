class MeetingRoom {

    /**
     * @param {{id: Number, creationDateTime: String, name: String, usernames: String[]}} properties
     */
    static fromProperties(properties) {
        return new MeetingRoom(
            properties.id,
            properties.creationDateTime,
            properties.name,
            properties.usernames);
    }

    /**
     * @param {Number} id
     * @param {String} creationDateTime
     * @param {String} name
     * @param {String[]} usernames
     */
    constructor(id, creationDateTime, name, usernames) {
        this._id = id;
        this._creationDateTime = creationDateTime;
        this._name = name;
        this._usernames = usernames;
    }

    get id() {
        return this._id;
    }

    get creationDateTime() {
        return this._creationDateTime;
    }

    get name() {
        return this._name;
    }

    get usernames() {
        return this._usernames;
    }
}

export default MeetingRoom;