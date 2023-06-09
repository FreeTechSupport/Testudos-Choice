FROM node:12

#create app directory
WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install

#Bundle app source
COPY . .

EXPOSE 8080

CMD [ "node", "app.js"]