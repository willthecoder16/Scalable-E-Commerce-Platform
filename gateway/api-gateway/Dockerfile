FROM node:20-alpine

WORKDIR /app

COPY shared /shared
RUN cd /shared && npm install --omit=dev

COPY gateway/api-gateway/package.json ./
RUN npm install --omit=dev

COPY gateway/api-gateway/src ./src

ENV NODE_PATH=/shared:/app/node_modules
ENV SERVICE_NAME=api-gateway

EXPOSE 8080

CMD ["node", "src/index.js"]
