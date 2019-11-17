# WebRTC demo

## Introduction
The goal of this demo is to showcase how to use WebRTC to allow web users to communicate with each other with audio
and video.

## Compilation and local deployment
### Compilation and quick tests
In order to compile and run this demo, make sure you have
[OpenJDK 11](https://adoptopenjdk.net/?variant=openjdk11&jvmVariant=hotspot),
[Apache Maven 3](https://maven.apache.org/) and [git](https://git-scm.com/) installed in your computer.

Open a terminal on your computer and execute the following commands:
```bash
# Navigate to the folder where you store your projects
cd $HOME/projects

# Clone this demo
git clone https://github.com/marcplouhinec/webrtcdemo.git
cd webrtcdemo

# Compile the application
mvn clean package

# Start the application
mvn spring-boot:run
```

After few seconds, the application should be running and you can test it with
[Firefox](https://www.mozilla.org/en-US/firefox/new/) by navigating to the URL:
[http://localhost:8080](http://localhost:8080).

The application will ask you to choose a user name. Open a second Firefox tab with the same URL and choose
another user name. You can then create a conference call from one tab to another.

If you want to test your application with other web browsers (such as
[Google Chrome](https://www.google.com/intl/en/chrome/)) or with your smartphone, you need to install and configure
two components:
* A [STUN / TURN server](https://www.html5rocks.com/en/tutorials/webrtc/infrastructure/).
* A [reverse proxy](https://en.wikipedia.org/wiki/Reverse_proxy) with a
  [SSL / TLS certificate](https://en.wikipedia.org/wiki/Public_key_certificate).

### Local STUN / TURN server
Let's start by installing [Coturn](https://github.com/coturn/coturn), a STUN / TURN server.
If you are using Ubuntu Linux, run:
```bash
apt-get install coturn
```
If you are using MacOS, run:
```bash
brew install coturn
```
Coturn needs to be configured. If you are using Ubuntu Linux, edit the file "/etc/default/coturn", find the
following line and uncomment it by removing '#' symbol:
```
#TURNSERVER_ENABLED=1
```
Note: this operation above is not necessary on MacOS.

Edit the main Coturn configuration file: on Ubuntu Linux the file is located at "/etc/turnserver.conf"; on MacOSX
the file is located at "/usr/local/Cellar/coturn/4.5.0.7/etc/turnserver.conf.default" (copy it to
"/etc/turnserver.conf" and edit the copy):
* Uncomment "#fingerprint"
* Add a line "user=webrtcdemo:Shenzhen2019"
* Add a line "external-ip=192.168.0.5/127.0.0.1" where "192.168.0.5" is the machine private IP address
* Add a line "server-name=localhost"
* Add a line "realm=localhost"

Start Coturn with the following command:
```bash
turnserver -c /etc/turnserver.conf -v
```

### Local SSL / TLS certificate
Let's continue the preparation of the local development environment by generating a SSL / TLS certificate with
[mkcert](https://github.com/FiloSottile/mkcert#readme).

On Ubuntu, you can install mkcert with the following commands:
```bash
# Install certutil
apt-get -y install libnss3-tools

# Install mkcert
wget https://github.com/FiloSottile/mkcert/releases/download/v1.4.1/mkcert-v1.4.1-linux-amd64
mv mkcert-v1.1.2-linux-amd64 mkcert
chmod +x mkcert
sudo cp mkcert /usr/local/bin/
```

On MacOS, you can install mkcert with the following commands:
```bash
# Install certutil
brew install nss

# Install mkcert
brew install mkcert
```

We can now generate a local [certificate authority](https://en.wikipedia.org/wiki/Certificate_authority) and
a SSL/TLS certificate on our computer:
```bash
# Generate a local CA
mkcert -install

# Generate a local SSL/TLS certificates
sudo mkdir /etc/dev-certificates
cd /etc/dev-certificates
sudo mkcert dev.local '*.dev.local' localhost 127.0.0.1 ::1
sudo chmod ugo+r /etc/dev-certificates/*.pem
```

As you can see we have generated a certificate for a fake domain name "dev.local", let's configure our computer
to resolve this domain to [localhost](https://en.wikipedia.org/wiki/Localhost). In your terminal, open the
"/etc/hosts" file:
```bash
sudo nano /etc/hosts
```
And append the following line:
```
127.0.0.1       webrtcdemo.dev.local
```

### Local reverse proxy
We can now install [Nginx](https://nginx.org), a HTTP server that we will use as a reverse proxy.

Open a terminal to install Nginx:
```bash
# On Ubuntu
apt-get -y install nginx

# On MacOS
brew install nginx
```

Save the following Nginx configuration file to `/etc/nginx/conf.d/webrtcdemo.conf` for Ubuntu or
`/usr/local/etc/nginx/servers/webrtcdemo.conf` for MacOS:
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

Prepare and start Nginx:
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

### Accessing the application via HTTPS
Make sure the application is still running (if not, re-run `mvn spring-boot:run` from the project folder), then
open two web browsers (e.g. Firefox and Chrome) on [https://webrtcdemo.dev.local/](https://webrtcdemo.dev.local/).

Both web browser should accept our SSL/TLS certificate thanks to our local CA. You can now establish an WebRTC
connection across web browsers!

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
* [OpenJDK 11](https://adoptopenjdk.net/?variant=openjdk11&jvmVariant=hotspot)
* [Apache Maven](https://maven.apache.org/)
* [Git](https://git-scm.com/)
* [Mkcert](https://github.com/FiloSottile/mkcert#readme)
* [Terraform](http://terraform.io/)
* [Coturn](https://github.com/coturn/coturn)
* [Nginx](https://nginx.org)
* [Let's Encrypt](https://letsencrypt.org)
* [Alibaba Cloud](https://www.alibabacloud.com)

## See also
* [Great documentation about WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
