const express = require('express');
const cors = require('cors');
const {
  logger,
  registerWithConsul,
  deregisterFromConsul,
  metricsMiddleware,
  metricsHandler,
  createHealthRouter,
} = require('/shared');
const { redis } = require('./redis');
const routes = require('./routes');

const PORT = Number(process.env.PORT || 3003);
const SERVICE_NAME = 'cart-service';

async function start() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(metricsMiddleware);

  app.use(createHealthRouter({
    redis: async () => {
      const pong = await redis.ping();
      if (pong !== 'PONG') throw new Error('Redis unhealthy');
    },
  }));

  app.get('/metrics', metricsHandler);
  app.use('/api/cart', routes);

  app.use((err, _req, res, _next) => {
    logger.error('Request error', { error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  });

  const server = app.listen(PORT, async () => {
    logger.info(`${SERVICE_NAME} listening on port ${PORT}`);
    try {
      app.locals.consul = await registerWithConsul({
        name: SERVICE_NAME,
        port: PORT,
        tags: ['cart'],
      });
    } catch (err) {
      logger.warn('Consul registration failed', { error: err.message });
    }
  });

  const shutdown = async () => {
    if (app.locals.consul) {
      await deregisterFromConsul(app.locals.consul.consul, app.locals.consul.serviceId);
    }
    redis.disconnect();
    server.close(() => process.exit(0));
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

start().catch((err) => {
  logger.error('Failed to start', { error: err.message });
  process.exit(1);
});
