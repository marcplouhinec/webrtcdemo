import StunTurnServerConfig from '../model/StunTurnServerConfig.js'

const stunTurnService = {

    /**
     * @return {Promise<StunTurnServerConfig>}
     */
    async getServerConfiguration() {
        const response = await fetch('/stun-turn/config', {method: 'GET'});
        return StunTurnServerConfig.fromProperties(await response.json());
    }

};

export default stunTurnService;
