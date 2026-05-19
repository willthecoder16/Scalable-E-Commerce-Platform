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
const { initDb, pool } = require('./db');
const routes = require('./routes');

const PORT = Number(process.env.PORT || 3001);
const SERVICE_NAME = 'user-service';

async function start() {
  await initDb();

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(metricsMiddleware);

  app.use(createHealthRouter({
    database: async () => {
      await pool.query('SELECT 1');
    },
  }));

  app.get('/metrics', metricsHandler);
  app.use('/api/users', routes);

  app.use((err, _req, res, _next) => {
    logger.error('Request error', { error: err.message, stack: err.stack });
    res.status(500).json({ error: 'Internal server error' });
  });

  const server = app.listen(PORT, async () => {
    logger.info(`${SERVICE_NAME} listening on port ${PORT}`);
    try {
      const registration = await registerWithConsul({
        name: SERVICE_NAME,
        port: PORT,
        tags: ['users', 'auth'],
      });
      app.locals.consul = registration;
    } catch (err) {
      logger.warn('Consul registration failed', { error: err.message });
    }
  });

  const shutdown = async () => {
    logger.info('Shutting down...');
    if (app.locals.consul) {
      await deregisterFromConsul(app.locals.consul.consul, app.locals.consul.serviceId);
    }
    await pool.end();
    server.close(() => process.exit(0));
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

start().catch((err) => {
  logger.error('Failed to start', { error: err.message });
  process.exit(1);
});
