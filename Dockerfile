FROM oven/bun

WORKDIR /usr/src/app

COPY package*.json bun.lockb ./
RUN bun install
COPY . .
COPY stack.env ./.env

ENV NODE_ENV production

CMD [ "bun", "start" ]