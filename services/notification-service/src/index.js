const express = require('express');
const cors = require('cors');
const {
  logger,
  registerWithConsul,
  deregisterFromConsul,
  metricsMiddleware,
  metricsHandler,
  createHealthRouter,
  connectMessaging,
  closeMessaging,
  subscribeEvent,
} = require('/shared');
const { registerEventHandlers } = require('./handlers');
const { sendEmail, sendSms, getNotifications } = require('./providers');

const PORT = Number(process.env.PORT || 3006);
const SERVICE_NAME = 'notification-service';

async function start() {
  await connectMessaging();
  registerEventHandlers(subscribeEvent);

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(metricsMiddleware);

  app.use(createHealthRouter());

  app.get('/metrics', metricsHandler);

  app.get('/api/notifications', (_req, res) => {
    res.json({ notifications: getNotifications() });
  });

  app.post('/api/notifications/email', async (req, res, next) => {
    try {
      const { to, subject, body } = req.body;
      if (!to || !subject) {
        return res.status(400).json({ error: 'to and subject are required' });
      }
      const notification = await sendEmail({ to, subject, body });
      res.status(201).json({ notification });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/notifications/sms', async (req, res, next) => {
    try {
      const { to, message } = req.body;
      if (!to || !message) {
        return res.status(400).json({ error: 'to and message are required' });
      }
      const notification = await sendSms({ to, message });
      res.status(201).json({ notification });
    } catch (err) {
      next(err);
    }
  });

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
        tags: ['notifications'],
      });
    } catch (err) {
      logger.warn('Consul registration failed', { error: err.message });
    }
  });

  const shutdown = async () => {
    if (app.locals.consul) {
      await deregisterFromConsul(app.locals.consul.consul, app.locals.consul.serviceId);
    }
    await closeMessaging();
    server.close(() => process.exit(0));
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

start().catch((err) => {
  logger.error('Failed to start', { error: err.message });
  process.exit(1);
});
