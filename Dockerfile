FROM oven/bun

WORKDIR /app

COPY package*.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .
COPY stack.env ./.env
RUN bun compile

ENV NODE_ENV production

CMD [ "bun", "start" ]