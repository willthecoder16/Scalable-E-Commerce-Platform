FROM node:20-alpine

WORKDIR /app

COPY shared /shared
RUN cd /shared && npm install --omit=dev

COPY services/user-service/package.json ./
RUN npm install --omit=dev

COPY services/user-service/src ./src

ENV NODE_PATH=/shared:/app/node_modules
ENV SERVICE_NAME=user-service

EXPOSE 3001

CMD ["node", "src/index.js"]
