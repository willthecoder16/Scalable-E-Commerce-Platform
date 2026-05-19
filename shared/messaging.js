const amqp = require('amqplib');
const logger = require('./logger');

const EXCHANGE = 'ecommerce.events';

let connection;
let channel;

async function connectMessaging() {
  const url = process.env.RABBITMQ_URL || 'amqp://localhost';
  connection = await amqp.connect(url);
  channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
  logger.info('Connected to RabbitMQ');
  return { connection, channel };
}

async function publishEvent(routingKey, payload) {
  if (!channel) {
    logger.warn('RabbitMQ not connected, skipping publish', { routingKey });
    return;
  }
  channel.publish(
    EXCHANGE,
    routingKey,
    Buffer.from(JSON.stringify({ ...payload, timestamp: new Date().toISOString() })),
    { persistent: true, contentType: 'application/json' }
  );
  logger.info('Published event', { routingKey });
}

async function subscribeEvent(routingKey, handler) {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized');
  }

  const queue = await channel.assertQueue('', { exclusive: true });
  await channel.bindQueue(queue.queue, EXCHANGE, routingKey);

  channel.consume(queue.queue, async (msg) => {
    if (!msg) return;
    try {
      const data = JSON.parse(msg.content.toString());
      await handler(data);
      channel.ack(msg);
    } catch (err) {
      logger.error('Event handler error', { routingKey, error: err.message });
      channel.nack(msg, false, false);
    }
  });

  logger.info('Subscribed to events', { routingKey });
}

async function closeMessaging() {
  if (channel) await channel.close();
  if (connection) await connection.close();
}

module.exports = {
  EXCHANGE,
  connectMessaging,
  publishEvent,
  subscribeEvent,
  closeMessaging,
};
