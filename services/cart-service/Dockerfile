FROM node:20-alpine

WORKDIR /app

COPY shared /shared
RUN cd /shared && npm install --omit=dev

COPY services/cart-service/package.json ./
RUN npm install --omit=dev

COPY services/cart-service/src ./src

ENV NODE_PATH=/shared:/app/node_modules
ENV SERVICE_NAME=cart-service

EXPOSE 3003

CMD ["node", "src/index.js"]
