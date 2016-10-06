FROM node:6.6.0-slim

COPY . /app

WORKDIR /app

RUN npm i

CMD npm run start

VOLUME /app/files/

EXPOSE 3000
