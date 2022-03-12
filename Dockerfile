# Install dependencies only when needed
FROM node:alpine AS deps
WORKDIR /usr/src/app


COPY package.json .

RUN npm i

COPY . ./

# building the app

RUN npm run build

# Running the app
CMD [ "npm", "start" ]