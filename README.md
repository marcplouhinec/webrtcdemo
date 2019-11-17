# WebRTC demo

## Introduction
The goal of this demo is to showcase how to use WebRTC to allow web users to communicate with each other with audio
and video.

## Compilation and local deployment
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
             proxy_pass http://webrtcdemo.dev.local:8080/;
             proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
             proxy_set_header X-Forwarded-Proto $scheme;
             proxy_set_header X-Forwarded-Port $server_port;
			 
             proxy_http_version 1.1;
             proxy_set_header Upgrade $http_upgrade;
             proxy_set_header Connection "upgrade";
			 proxy_pass_header X-XSRF-TOKEN;
			 proxy_set_header Origin "http://webrtcdemo.dev.local:8080";
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
This demo uses [Terraform](http://terraform.io/) and [Alibaba Cloud](https://www.alibabacloud.com) (if you prefer
another cloud vendor, please make sure you adapt the Terraform scripts first).

If you don't have any, [create an Alibaba Cloud account](https://www.alibabacloud.com/help/doc-detail/50482.htm) and
[obtain an access key id and secret](https://www.alibabacloud.com/help/faq-detail/63482.htm).

You also need to [buy a domain name](https://www.alibabacloud.com/domain) with Alibaba Cloud (e.g.
"my-example-domain.xyz").

In addition, please [install Terraform](https://learn.hashicorp.com/terraform/getting-started/install.html) on
your computer.

Open a terminal on your computer and execute the following commands:
```bash
# Navigate to the location where you have downloaded this project
cd ~/projects/webrtc-demo

# Compile the application
mvn clean package

# Configure the Terraform scripts
export ALICLOUD_ACCESS_KEY="your-accesskey-id"
export ALICLOUD_SECRET_KEY="your-accesskey-secret"
export ALICLOUD_REGION="your-region-id" # see https://www.alibabacloud.com/help/doc-detail/40654.htm

# Top domain name
export TF_VAR_domain_name="my-example-domain.xyz"
# Sub-domain name for the STUN / TURN server that allows users to bypass NAT firewalls for WebRTC
export TF_VAR_stunturn_sub_domain_name="webrtcdemo-stunturn"
# Sub-domain name for the web application
export TF_VAR_webapp_sub_domain_name="webrtcdemo"
# Root password for all ECS instances
export TF_VAR_ecs_root_password="YourR00tPassword"
# Username for STUN / TURN server authentication
export TF_VAR_stunturn_user="webrtcdemo"
# Password for STUN / TURN server authentication
export TF_VAR_stunturn_password="YourStunTurnPassw0rd"
# Email address that will receive notifications when TLS / SSL certificates are going to expire
export TF_VAR_lets_encrypt_email_address="your.email@example.net"

# Build the base infrastructure
cd infrastructure/00_base
terraform init
terraform apply

# Build the STUN / TURN server infrastructure
cd ../10_stun_turn_server
terraform init
terraform apply

# Build the web application infrastructure
cd ../20_webapp
terraform init
terraform apply
```

You can test the web application by browsing to its URL (e.g. https://webrtcdemo.my-example-domain.xyz).

## External dependencies
Framework and libraries:
* [Spring Boot](https://spring.io/projects/spring-boot)
* [SocksJS client](https://github.com/sockjs/sockjs-client)
* [STOMP.js](https://stomp-js.github.io/stomp-websocket/)
* [WebRTC adapter](https://github.com/webrtchacks/adapter#readme)

Tools:
* [Terraform](http://terraform.io/)
* [Coturn](https://github.com/coturn/coturn)
* [Nginx](https://nginx.org)
* [Let's Encrypt](https://letsencrypt.org)
* [Alibaba Cloud](https://www.alibabacloud.com)

## See also
* [Great documentation about WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
