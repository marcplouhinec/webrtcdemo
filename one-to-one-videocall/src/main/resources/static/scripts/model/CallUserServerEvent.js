import UserServerEventCode from './UserServerEventCode.js';
import UserServerEvent from './UserServerEvent.js';

class CallUserServerEvent extends UserServerEvent {

    /**
     * @param {{code: UserServerEventCode, callerUserId: Number, otherUserId: Number}} properties
     */
    static fromProperties(properties) {
        return new CallUserServerEvent(properties.code, properties.callerUserId, properties.otherUserId);
    }

    /**
     * @param {UserServerEventCode} code
     * @param {Number} callerUserId
     * @param {Number} otherUserId
     */
    constructor(code, callerUserId, otherUserId) {
        super(code);
        this._callerUserId = callerUserId;
        this._otherUserId = otherUserId;
    }

    get callerUserId() {
        return this._callerUserId;
    }

    get otherUserId() {
        return this._otherUserId;
    }
}

export default CallUserServerEvent;