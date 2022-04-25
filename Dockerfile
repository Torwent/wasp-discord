FROM node:16.2.0-alpine3.13
WORKDIR /usr/src/app
COPY . .
RUN npm ci && npm prune --production
# our app is running on port 4000 within the container, so need to expose it
EXPOSE 4000
CMD ["node", "index.js"]