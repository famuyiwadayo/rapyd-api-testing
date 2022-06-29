FROM node:16-alpine3.14


LABEL AUTHOR github.com/famuyiwadayo

RUN mkdir -p /app/node_modules && chown -R node:node /app

WORKDIR /app 

COPY --chown=node:node package*.json ./

RUN yarn install

COPY --chown=node:node . ./

USER node 

EXPOSE 3000

CMD ["yarn", "run", "serve"]