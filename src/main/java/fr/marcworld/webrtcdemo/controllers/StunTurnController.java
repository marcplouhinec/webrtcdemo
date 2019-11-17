package fr.marcworld.webrtcdemo.controllers;

import fr.marcworld.webrtcdemo.dtos.StunTurnServerConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class StunTurnController {

    @Value("${stunTurnServer.url}")
    private String stunTurnServerUrl;

    @Value("${stunTurnServer.username}")
    private String stunTurnServerUsername;

    @Value("${stunTurnServer.password}")
    private String stunTurnServerPassword;

    @RequestMapping("/stun-turn/config")
    public StunTurnServerConfig getServerConfiguration() {
        return new StunTurnServerConfig(
                stunTurnServerUrl,
                stunTurnServerUsername,
                stunTurnServerPassword);
    }

}
