const Consul = require('consul');
const logger = require('./logger');

function getConsulClient() {
  return new Consul({
    host: process.env.CONSUL_HOST || 'localhost',
    port: process.env.CONSUL_PORT || '8500',
    promisify: true,
  });
}

async function registerWithConsul({ name, port, tags = [] }) {
  const consul = getConsulClient();
  const serviceId = `${name}-${process.env.HOSTNAME || 'local'}-${port}`;
  const address = process.env.SERVICE_ADDRESS || name;

  await consul.agent.service.register({
    id: serviceId,
    name,
    address,
    port: Number(port),
    tags: [...tags, 'ecommerce'],
    check: {
      http: `http://${address}:${port}/health`,
      interval: '10s',
      timeout: '5s',
      deregistercriticalserviceafter: '1m',
    },
  });

  logger.info('Registered with Consul', { serviceId, name, port });
  return { consul, serviceId };
}

async function deregisterFromConsul(consul, serviceId) {
  if (consul && serviceId) {
    await consul.agent.service.deregister(serviceId);
    logger.info('Deregistered from Consul', { serviceId });
  }
}

async function discoverService(name) {
  const consul = getConsulClient();
  const result = await consul.health.service({ service: name, passing: true });
  if (!result || result.length === 0) {
    return null;
  }
  const entry = result[Math.floor(Math.random() * result.length)];
  const svc = entry.Service;
  return {
    host: svc.Address,
    port: svc.Port,
    url: `http://${svc.Address}:${svc.Port}`,
  };
}

module.exports = { registerWithConsul, deregisterFromConsul, discoverService, getConsulClient };
