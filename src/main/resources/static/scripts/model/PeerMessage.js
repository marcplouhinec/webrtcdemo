import PeerMessageCode from './PeerMessageCode.js';

class PeerMessage {

    /**
     * @param {{code: PeerMessageCode, jsonPayload: String, senderUserId: Number}} properties
     */
    static fromProperties(properties) {
        return new PeerMessage(properties.code, properties.jsonPayload, properties.senderUserId);
    }

    /**
     * @param {PeerMessageCode} code
     * @param {String} jsonPayload
     * @param {Number} senderUserId
     */
    constructor(code, jsonPayload, senderUserId) {
        this.code = code;
        this.jsonPayload = jsonPayload;
        this.senderUserId = senderUserId;
    }

}

export default PeerMessage;