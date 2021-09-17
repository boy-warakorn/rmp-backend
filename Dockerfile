FROM node:14-alpine as builder
USER root
ENV NODE_ENV build


WORKDIR /home/node/app

COPY . /home/node/app

RUN npm install --frozen-lockfile \
    && npm run build 

# ---

USER root
FROM node:14-alpine

ENV NODE_ENV production

ENV TZ=Asia/Bangkok
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone


WORKDIR /home/node/app

COPY --chown=node:node --from=builder /home/node/app/package*.json /home/node/app/
COPY --chown=node:node --from=builder  /home/node/app/node_modules/ /home/node/app/node_modules/
COPY --chown=node:node --from=builder /home/node/app/dist/ /home/node/app/dist/


CMD ["node", "dist/main"]