FROM node:20-alpine

WORKDIR /app

COPY shared /shared
RUN cd /shared && npm install --omit=dev

COPY services/product-service/package.json ./
RUN npm install --omit=dev

COPY services/product-service/src ./src

ENV NODE_PATH=/shared:/app/node_modules
ENV SERVICE_NAME=product-service

EXPOSE 3002

CMD ["node", "src/index.js"]
