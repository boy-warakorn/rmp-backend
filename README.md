# Residential Management System Service (RMP)

This is a service for RMP.

## Authors

- Mr. Warakorn  Chantranupong
- Mr. Anawat Paothong
- Mr. Noppanut Boonrueng

## Installation

Make sure you run `npm install` before start below steps.

### For Server

Install on GCP server (Debian)

#### Install Git
1. `sudo apt update`
2. `sudo apt install git`

#### Install Docker Engine
1. `sudo apt-get install \
    ca-certificates \
    curl \
    gnupg \
    lsb-release`
2. `curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg`
3. `echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null`
4. `sudo apt-get update`
5. `sudo apt-get install docker-ce docker-ce-cli containerd.io`

#### Install Docker Compose
1. `sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose`
2. `sudo chmod +x /usr/local/bin/docker-compose`

#### Run Docker Compose
1. Before run below command please add `.env` for this project. `database_host`, `database_username`, and `database_password` is in `docker-compose.yml` file
2. `docker-compose up -d --build`

Done!

### For Local

1. `npm run start:dev`
