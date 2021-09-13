FROM node:14.17-alpine As development

WORKDIR /usr/src/app

COPY package*.json ./

RUN apk add --no-cache --virtual .gyp python make g++ && npm install && apk del .gyp
# --only=development

COPY . .

RUN npm run build

FROM node:14.17-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN apk add --no-cache --virtual .gyp python make g++ && npm install --only=production && apk del .gyp

COPY . .

COPY --from=development /usr/src/app/dist ./dist

ENV TZ=Asia/Bangkok

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

CMD ["node", "dist/main"]