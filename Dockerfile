###################
# BUILD DEPENDENCIES
###################
FROM node:18-alpine As build

WORKDIR /usr/src/app

COPY --chown=node:node .yarn  ./.yarn
COPY --chown=node:node package.json yarn.lock .yarnrc.yml ./

RUN yarn --frozen-lockfile && yarn cache clean

COPY --chown=node:node config ./config
COPY --chown=node:node .env package.json nest-cli.json tsconfig.build.json tsconfig.json .yarnrc.yml ./
COPY --chown=node:node . .

RUN yarn build

ENV NODE_ENV production

RUN yarn workspaces focus --production && yarn cache clean

USER node

###################
# PRODUCTION
###################

FROM node:18-alpine As production

WORKDIR /usr/src/app

COPY --chown=node:node config ./config
COPY --chown=node:node files ./files
COPY --chown=node:node .env ./
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

CMD [ "node", "dist/main.js" ]