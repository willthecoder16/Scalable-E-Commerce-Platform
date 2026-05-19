const axios = require('axios');
const { discoverService } = require('/shared/consul');
const logger = require('/shared/logger');

const FALLBACK_URLS = {
  'user-service': process.env.USER_SERVICE_URL || 'http://user-service:3001',
  'product-service': process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002',
  'cart-service': process.env.CART_SERVICE_URL || 'http://cart-service:3003',
  'order-service': process.env.ORDER_SERVICE_URL || 'http://order-service:3004',
  'payment-service': process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3005',
  'notification-service': process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3006',
};

async function resolveServiceUrl(serviceName) {
  try {
    const discovered = await discoverService(serviceName);
    if (discovered?.url) {
      return discovered.url;
    }
  } catch (err) {
    logger.warn('Consul discovery failed, using fallback', {
      serviceName,
      error: err.message,
    });
  }
  return FALLBACK_URLS[serviceName];
}

async function proxyRequest(serviceName, req, res) {
  try {
    const baseUrl = await resolveServiceUrl(serviceName);
    const targetPath = req.originalUrl.replace(/^\/api/, '/api');
    const url = `${baseUrl}${targetPath}`;

    const response = await axios({
      method: req.method,
      url,
      data: req.body,
      headers: {
        ...req.headers,
        host: undefined,
        'content-length': undefined,
      },
      params: req.query,
      validateStatus: () => true,
    });

    res.status(response.status).set(response.headers).send(response.data);
  } catch (err) {
    logger.error('Proxy error', { serviceName, error: err.message });
    res.status(502).json({ error: 'Service unavailable', service: serviceName });
  }
}

module.exports = { proxyRequest, resolveServiceUrl };
