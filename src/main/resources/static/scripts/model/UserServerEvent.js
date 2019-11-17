import UserServerEventCode from './UserServerEventCode.js';

class UserServerEvent {

    /**
     * @param {{code: UserServerEventCode, payload: Object}} properties
     */
    static fromProperties(properties) {
        return new UserServerEvent(properties.code, properties.payload);
    }

    /**
     * @param {UserServerEventCode} code
     * @param {Object} payload
     */
    constructor(code, payload) {
        this.code = code;
        this.payload = payload;
    }
}

export default UserServerEvent;