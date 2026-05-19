FROM node:20-alpine

WORKDIR /app

COPY shared /shared
RUN cd /shared && npm install --omit=dev

COPY services/notification-service/package.json ./
RUN npm install --omit=dev

COPY services/notification-service/src ./src

ENV NODE_PATH=/shared:/app/node_modules
ENV SERVICE_NAME=notification-service

EXPOSE 3006

CMD ["node", "src/index.js"]
