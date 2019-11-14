import UserServerEventCode from './UserServerEventCode.js';

class UserServerEvent {

    /**
     * @param {{code: UserServerEventCode}} properties
     */
    static fromProperties(properties) {
        return new UserServerEvent(properties.code);
    }

    /**
     * @param {UserServerEventCode} code
     */
    constructor(code) {
        this._code = code;
    }

    get code() {
        return this._code;
    }
}

export default UserServerEvent;