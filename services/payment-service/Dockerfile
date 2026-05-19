FROM node:20-alpine

WORKDIR /app

COPY shared /shared
RUN cd /shared && npm install --omit=dev

COPY services/payment-service/package.json ./
RUN npm install --omit=dev

COPY services/payment-service/src ./src

ENV NODE_PATH=/shared:/app/node_modules
ENV SERVICE_NAME=payment-service

EXPOSE 3005

CMD ["node", "src/index.js"]
