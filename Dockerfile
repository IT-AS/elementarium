FROM node:16 as base

WORKDIR /home/node/app

COPY server ./server
COPY shared ./shared
COPY client ./client

WORKDIR /home/node/app/server

RUN npm i
RUN npm run build

WORKDIR /home/node/app/client

RUN npm i
RUN npm run publish


FROM base as production

WORKDIR /home/node/app/server

COPY --from=base /home/node/app/client/dist/elementarium-client ./client

EXPOSE 4000

CMD ["node", "dist/server/src/app.js"]
