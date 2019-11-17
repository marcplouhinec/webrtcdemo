# WebRTC demo

## Introduction
The goal of this demo is to showcase how to use WebRTC to allow web users to communicate with each other with audio
and video.

## Compilation
TODO

## Local deployment
TODO

TODO install coturn https://github.com/alibabacloud-howto/apsara-video-live-demo

TODO install mkcert
Ubuntu: https://kifarunix.com/how-to-create-self-signed-ssl-certificate-with-mkcert-on-ubuntu-18-04/
MacOS:
```bash
brew install nss
brew install mkcert
```

Use:
```bash
# Generate Local CA
mkcert -install

# Generate Local SSL Certificates
sudo mkdir /etc/dev-certificates
cd /etc/dev-certificates
sudo mkcert dev.local '*.dev.local' localhost 127.0.0.1 ::1
sudo chmod ugo+r /etc/dev-certificates/*.pem
```

Install Nginx:
```bash
# On Ubuntu
apt-get -y install nginx

# On MacOS
brew install nginx
```

Add the Nginx config file (Ubuntu: /etc/nginx/conf.d/webrtcdemo.conf, 
MacOS: /usr/local/etc/nginx/servers/webrtcdemo.conf):
```
server {
        listen 80 default_server;
        listen [::]:80 default_server;

        server_name webrtcdemo.dev.local;

        location / {
                return 301 https://$host$request_uri;
		}
}

server {
        listen [::]:443 ssl ipv6only=on;
        listen 443 ssl;

        server_name webrtcdemo.dev.local;

        ssl_certificate /etc/dev-certificates/dev.local+4.pem;
        ssl_certificate_key /etc/dev-certificates/dev.local+4-key.pem;

        location / {
             proxy_pass http://localhost:8080/;
             proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
             proxy_set_header X-Forwarded-Proto $scheme;
             proxy_set_header X-Forwarded-Port $server_port;
        }
        
        location /stomp-endpoint/ {
            proxy_pass "http://localhost:8080/stomp-endpoint/";
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
}
```

```bash
# Check the Nginx configuration
nginx -t

# Remove the default configuration (Ubuntu)
rm /etc/nginx/sites-enabled/default

# Remove the default configuration (MacOS)
sudo nano /usr/local/etc/nginx/nginx.conf # comment the server { } section

# Start nginx
nginx
```

TODO add webrtcdemo.dev.local to /etc/hosts
```bash
sudo nano /etc/hosts
# Add: 127.0.0.1       webrtcdemo.dev.local
```

Start the application:
```bash
cd $HOME/projects/webrtc-demo
mvn spring-boot:run
```

Open 2 web browsers (e.g. Firefox and Chrome) to https://webrtcdemo.dev.local/

## Cloud deployment
TODO

## Dependencies
* [Spring Boot](https://spring.io/projects/spring-boot)
* [SocksJS client](https://github.com/sockjs/sockjs-client)
* [STOMP.js](https://stomp-js.github.io/stomp-websocket/)
* [WebRTC adapter](https://github.com/webrtchacks/adapter#readme)

## External documentation
* [Great documentation about WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)