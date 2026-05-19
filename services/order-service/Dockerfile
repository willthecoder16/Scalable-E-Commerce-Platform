FROM node:20-alpine

WORKDIR /app

COPY shared /shared
RUN cd /shared && npm install --omit=dev

COPY services/order-service/package.json ./
RUN npm install --omit=dev

COPY services/order-service/src ./src

ENV NODE_PATH=/shared:/app/node_modules
ENV SERVICE_NAME=order-service

EXPOSE 3004

CMD ["node", "src/index.js"]
