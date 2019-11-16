class ConferenceCall {

    /**
     * @param {{callerUserId: Number, otherUserId: Number, roomNumber: Number}} properties
     */
    static fromProperties(properties) {
        return new ConferenceCall(properties.callerUserId, properties.otherUserId, properties.roomNumber);
    }

    /**
     * @param {Number} callerUserId
     * @param {Number} otherUserId
     * @param {Number} roomNumber
     */
    constructor(callerUserId, otherUserId, roomNumber) {
        this.callerUserId = callerUserId;
        this.otherUserId = otherUserId;
        this.roomNumber = roomNumber;
    }
}

export default ConferenceCall;