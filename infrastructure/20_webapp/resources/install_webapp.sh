#!/usr/bin/env bash
#
# Web application installation script.
#
# Arguments:
# $1 = Domain name of the STUN / TURN server
# $2 = Username of the STUN / TURN server
# $3 = Password of the STUN / TURN server
# $4 = Sub-domain name of the web application.
# $5 = Email address for Let's Encrypt to notify us when a certificate is going to be expired.
#
# The following resources are expected in the /tmp folder:
# /tmp/nginx-webapp.conf
# /tmp/application.properties
# /tmp/webapp.jar
# /tmp/webapp.service

STUN_TURN_DOMAIN=$1
STUNTURN_USERNAME=$2
STUNTURN_PASSWORD=$3
WEBAPP_DOMAIN=$4
EMAIL_ADDRESS=$5

echo "STUN_TURN_DOMAIN=$STUN_TURN_DOMAIN"
echo "STUNTURN_USERNAME=$STUNTURN_USERNAME"
echo "STUNTURN_PASSWORD=$STUNTURN_PASSWORD"
echo "WEBAPP_DOMAIN=$WEBAPP_DOMAIN"
echo "EMAIL_ADDRESS=$EMAIL_ADDRESS"

# Update the distribution
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get -y upgrade

# Install JDK 11
echo "Install OpenJDK 11"
apt-get -y install software-properties-common
add-apt-repository -y ppa:openjdk-r/ppa
apt-get update
apt-get -y install openjdk-11-jre-headless

# Install Nginx
echo "Install Nginx"
apt-get -y install nginx

# Install Certbot for obtaining a Let's Encrypt certificate
echo "Install Certbot"
add-apt-repository -y ppa:certbot/certbot
apt-get update
apt-get -y install python-certbot-nginx

# Obtain the certificate
echo "Obtaining certificate"
certbot --nginx -d "${WEBAPP_DOMAIN}" --non-interactive --agree-tos --email "${EMAIL_ADDRESS}"

# Configure Nginx
echo "Configure Nginx"
export ESCAPED_WEBAPP_DOMAIN=$(echo ${WEBAPP_DOMAIN} | sed -e 's/\\/\\\\/g; s/\//\\\//g; s/&/\\\&/g')
sed -i "s/demo\.example\.com/${ESCAPED_WEBAPP_DOMAIN}/" /tmp/nginx-webapp.conf
cp /tmp/nginx-webapp.conf /etc/nginx/conf.d/webapp.conf
rm /etc/nginx/sites-enabled/default

# Configure the application
echo "Configure the webapp app"
export ESCAPED_STUN_TURN_DOMAIN=$(echo ${STUN_TURN_DOMAIN} | sed -e 's/\\/\\\\/g; s/\//\\\//g; s/&/\\\&/g')
export ESCAPED_STUNTURN_USERNAME=$(echo ${STUNTURN_USERNAME} | sed -e 's/\\/\\\\/g; s/\//\\\//g; s/&/\\\&/g')
export ESCAPED_STUNTURN_PASSWORD=$(echo ${STUNTURN_PASSWORD} | sed -e 's/\\/\\\\/g; s/\//\\\//g; s/&/\\\&/g')
sed -i "s/\(stunTurnServer\.url=\).*\$/\1turn:${ESCAPED_STUN_TURN_DOMAIN}:3478/" /tmp/application.properties
sed -i "s/\(stunTurnServer\.username=\).*\$/\1${ESCAPED_STUNTURN_USERNAME}/" /tmp/application.properties
sed -i "s/\(stunTurnServer\.password=\).*\$/\1${ESCAPED_STUNTURN_PASSWORD}/" /tmp/application.properties

mkdir -p /etc/webapp
mkdir -p /opt/webapp
cp /tmp/application.properties /etc/webapp/
cp /tmp/webapp.jar /opt/webapp/
cp /tmp/webapp.service /etc/systemd/system/

# Start and enable the application and Nginx
echo "Start the webapp app and Nginx"
systemctl start webapp.service
systemctl enable webapp.service
systemctl restart nginx
systemctl enable nginx