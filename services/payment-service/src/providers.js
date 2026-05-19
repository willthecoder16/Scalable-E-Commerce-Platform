const logger = require('/shared/logger');

async function processStripePayment({ amount, currency, paymentMethod }) {
  const mock = process.env.STRIPE_MOCK !== 'false';
  if (mock) {
    logger.info('[Stripe Mock] Processing payment', { amount, currency });
    await delay(300);
    if (paymentMethod === 'fail') {
      return { success: false, error: 'Card declined (mock)' };
    }
    return {
      success: true,
      transactionId: `pi_mock_${Date.now()}`,
      provider: 'stripe',
    };
  }
  // Production: integrate @stripe/stripe-js or stripe SDK
  throw new Error('Stripe live mode not configured');
}

async function processPayPalPayment({ amount, currency }) {
  const mock = process.env.PAYPAL_MOCK !== 'false';
  if (mock) {
    logger.info('[PayPal Mock] Processing payment', { amount, currency });
    await delay(300);
    return {
      success: true,
      transactionId: `pp_mock_${Date.now()}`,
      provider: 'paypal',
    };
  }
  throw new Error('PayPal live mode not configured');
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { processStripePayment, processPayPalPayment };
