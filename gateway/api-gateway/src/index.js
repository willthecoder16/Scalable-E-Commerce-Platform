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
const { proxyRequest } = require('./proxy');
const { authMiddleware } = require('./auth');

const PORT = Number(process.env.PORT || 8080);
const SERVICE_NAME = 'api-gateway';

const ROUTES = [
  { path: '/api/users', service: 'user-service' },
  { path: '/api/products', service: 'product-service' },
  { path: '/api/cart', service: 'cart-service' },
  { path: '/api/orders', service: 'order-service' },
  { path: '/api/payments', service: 'payment-service' },
  { path: '/api/notifications', service: 'notification-service' },
];

async function start() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(metricsMiddleware);

  app.use(createHealthRouter());

  app.get('/', (_req, res) => {
    res.json({
      name: 'E-Commerce API Gateway',
      version: '1.0.0',
      routes: ROUTES.map((r) => r.path),
    });
  });

  app.get('/metrics', metricsHandler);

  app.use(authMiddleware);

  for (const route of ROUTES) {
    app.use(route.path, (req, res) => proxyRequest(route.service, req, res));
  }

  app.use((err, _req, res, _next) => {
    logger.error('Gateway error', { error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  });

  const server = app.listen(PORT, async () => {
    logger.info(`${SERVICE_NAME} listening on port ${PORT}`);
    try {
      app.locals.consul = await registerWithConsul({
        name: SERVICE_NAME,
        port: PORT,
        tags: ['gateway', 'api'],
      });
    } catch (err) {
      logger.warn('Consul registration failed', { error: err.message });
    }
  });

  const shutdown = async () => {
    if (app.locals.consul) {
      await deregisterFromConsul(app.locals.consul.consul, app.locals.consul.serviceId);
    }
    server.close(() => process.exit(0));
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

start().catch((err) => {
  logger.error('Failed to start gateway', { error: err.message });
  process.exit(1);
});
