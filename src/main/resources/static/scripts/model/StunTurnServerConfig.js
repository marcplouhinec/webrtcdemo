class StunTurnServerConfig {

    /**
     * @param {{url: String, username: String, password: String}} properties
     */
    static fromProperties(properties) {
        return new StunTurnServerConfig(properties.url, properties.username, properties.password);
    }

    /**
     * @param {String} url
     * @param {String} username
     * @param {String} password
     */
    constructor(url, username, password) {
        this.url = url;
        this.username = username;
        this.password = password;
    }

}

export default StunTurnServerConfig;