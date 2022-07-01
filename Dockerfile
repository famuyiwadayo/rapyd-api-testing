#!/bin/bash


# FROM node:16-alpine3.14

# LABEL AUTHOR github.com/famuyiwadayo


# RUN mkdir -p /app/node_modules && chown -R node:node /app

# WORKDIR /app 

# COPY --chown=node:node package*.json ./

# RUN yarn install

# COPY --chown=node:node . ./

# USER node 

# EXPOSE 8080

# CMD ["yarn", "run", "serve"]
# CMD ["yarn", "run", "start"]


# Build Stage 1
# This build created a staging docker image
#
FROM node:16-alpine3.14 AS build
LABEL AUTHOR github.com/famuyiwadayo
WORKDIR /usr/src/app
COPY ./ ./
RUN yarn install
RUN yarn build

# Build Stage 2
# This build takes the production build from staging build
#
FROM node:16-alpine3.14
LABEL AUTHOR github.com/famuyiwadayo
WORKDIR /usr/src/app
COPY package.json ./
COPY tsconfig.json ./

# enabled next line if you want the .env to be built with the images
# note that when doing a CI/CD with githib, the command will fail.
# COPY .env ./ 

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
EXPOSE 8080
CMD yarn start