#!/bin/bash

echo "Pulling changes from git..."

git pull

echo "Attempting to install new dependencies..."

npm install

echo "Refreshing application commands..."

node deploy.js

echo "Deploying bot..."

node index.js
