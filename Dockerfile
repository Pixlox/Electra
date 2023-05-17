FROM node:18.6.0

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN node deploy.js

CMD [ "node", "index.js" ]