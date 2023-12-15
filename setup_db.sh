#!/bin/bash

# defaults
MYSQL_USER="root"
MYSQL_PASSWORD=""
MYSQL_HOST="127.0.0.1"

# check if user provided arguments
if [ $# -eq 2 ]; then
  MYSQL_USER="$1"
  MYSQL_PASSWORD="$2"
fi


#create database && messages table
MYSQL_SCRIPT=$(cat <<EOL
CREATE DATABASE IF NOT EXISTS spike-chat;
USE spike_chat;
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
EOL
)

mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -h"$MYSQL_HOST" -e "$MYSQL_SCRIPT"


if [ $? -eq 0 ]; then
  echo "MySQL script executed successfully"
else
  echo "Error executing MySQL script"
fi
