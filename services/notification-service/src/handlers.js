const { sendEmail, sendSms } = require('./providers');
const {
  orderConfirmationEmail,
  paymentReceiptEmail,
  shippingUpdateEmail,
} = require('./templates');
const logger = require('/shared/logger');

async function handleOrderCreated(event) {
  const email = event.email || `user-${event.userId}@example.com`;
  const tpl = orderConfirmationEmail({
    orderId: event.orderId,
    total: event.total,
    items: event.items,
  });

  await sendEmail({
    to: email,
    subject: tpl.subject,
    body: tpl.body,
    html: tpl.html,
    userId: event.userId,
    eventType: 'order.created',
    orderId: event.orderId,
  });

  if (event.phone) {
    await sendSms({
      to: event.phone,
      message: `ShopFlow: Order #${event.orderId.slice(0, 8)} confirmed. Total $${event.total.toFixed(2)}.`,
      userId: event.userId,
      eventType: 'order.created',
      orderId: event.orderId,
    });
  }
}

async function handlePaymentCompleted(event) {
  const email = event.email || `user-${event.userId}@example.com`;
  const tpl = paymentReceiptEmail({
    orderId: event.orderId,
    amount: event.amount,
    provider: event.provider || 'stripe',
    transactionId: event.transactionId,
  });

  await sendEmail({
    to: email,
    subject: tpl.subject,
    body: tpl.body,
    html: tpl.html,
    userId: event.userId,
    eventType: 'payment.completed',
    orderId: event.orderId,
  });
}

async function handleOrderStatusUpdated(event) {
  const email = event.email || `user-${event.userId}@example.com`;
  const tpl = shippingUpdateEmail({
    orderId: event.orderId,
    status: event.status,
  });

  await sendEmail({
    to: email,
    subject: tpl.subject,
    body: tpl.body,
    html: tpl.html,
    userId: event.userId,
    eventType: 'order.status.updated',
    orderId: event.orderId,
  });

  if (event.status === 'shipped' && event.phone) {
    await sendSms({
      to: event.phone,
      message: `ShopFlow: Order #${event.orderId.slice(0, 8)} has shipped! Track it in your account.`,
      userId: event.userId,
      eventType: 'order.shipped',
      orderId: event.orderId,
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
