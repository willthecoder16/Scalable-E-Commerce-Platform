const express = require('express');

function createHealthRouter(checks = {}) {
  const router = express.Router();

  router.get('/health', async (_req, res) => {
    const results = {};
    let healthy = true;

    for (const [name, checkFn] of Object.entries(checks)) {
      try {
        await checkFn();
        results[name] = 'ok';
      } catch (err) {
        results[name] = err.message;
        healthy = false;
      }
    }

    res.status(healthy ? 200 : 503).json({
      status: healthy ? 'healthy' : 'unhealthy',
      service: process.env.SERVICE_NAME,
      checks: results,
      timestamp: new Date().toISOString(),
    });
  });

  router.get('/ready', (_req, res) => {
    res.json({ status: 'ready', service: process.env.SERVICE_NAME });
  });

  return router;
}

module.exports = { createHealthRouter };
