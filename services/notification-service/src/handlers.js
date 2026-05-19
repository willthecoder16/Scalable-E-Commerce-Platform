const { sendEmail, sendSms } = require('./providers');
const logger = require('/shared/logger');

async function handleOrderCreated(event) {
  const email = event.email || `user-${event.userId}@example.com`;
  await sendEmail({
    to: email,
    subject: 'Order Confirmation',
    body: `Your order #${event.orderId} has been placed. Total: $${event.total.toFixed(2)}`,
  });

  if (event.phone) {
    await sendSms({
      to: event.phone,
      message: `Order #${event.orderId.slice(0, 8)} confirmed. Total: $${event.total.toFixed(2)}`,
    });
  }
}

async function handlePaymentCompleted(event) {
  await sendEmail({
    to: event.email || `user-${event.userId}@example.com`,
    subject: 'Payment Received',
    body: `Payment of $${event.amount} for order #${event.orderId} was successful.`,
  });
}

async function handleOrderStatusUpdated(event) {
  await sendEmail({
    to: event.email || `user-${event.userId}@example.com`,
    subject: `Order Update: ${event.status}`,
    body: `Your order #${event.orderId} status is now: ${event.status}`,
  });

  if (event.status === 'shipped' && event.phone) {
    await sendSms({
      to: event.phone,
      message: `Your order #${event.orderId.slice(0, 8)} has shipped!`,
    });
  }
}

function registerEventHandlers(subscribeEvent) {
  subscribeEvent('order.created', async (event) => {
    try {
      await handleOrderCreated(event);
    } catch (err) {
      logger.error('order.created handler failed', { error: err.message });
      throw err;
    }
  });

  subscribeEvent('payment.completed', async (event) => {
    try {
      await handlePaymentCompleted(event);
    } catch (err) {
      logger.error('payment.completed handler failed', { error: err.message });
      throw err;
    }
  });

  subscribeEvent('order.status.updated', async (event) => {
    try {
      await handleOrderStatusUpdated(event);
    } catch (err) {
      logger.error('order.status.updated handler failed', { error: err.message });
      throw err;
    }
  });
}

module.exports = { registerEventHandlers };
