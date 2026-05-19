const logger = require('./logger');
const { registerWithConsul, deregisterFromConsul } = require('./consul');
const { metricsMiddleware, metricsHandler, register } = require('./metrics');
const { createHealthRouter } = require('./health');
const messaging = require('./messaging');

module.exports = {
  ...messaging,
  logger,
  registerWithConsul,
  deregisterFromConsul,
  metricsMiddleware,
  metricsHandler,
  register,
  createHealthRouter,
};
