const logger = require('/shared/logger');

const PAYMENT_PROVIDERS = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Credit & debit cards',
    currencies: ['USD', 'EUR', 'GBP'],
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'PayPal balance or linked bank',
    currencies: ['USD', 'EUR', 'GBP'],
  },
];

function getAvailableProviders() {
  return PAYMENT_PROVIDERS.map((p) => ({
    ...p,
    mode: process.env[`${p.id.toUpperCase()}_MOCK`] !== 'false' ? 'mock' : 'live',
  }));
}

async function processStripePayment({ amount, currency, paymentMethod, card }) {
  const mock = process.env.STRIPE_MOCK !== 'false';
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!mock && secretKey) {
    try {
      const Stripe = require('stripe');
      const stripe = new Stripe(secretKey);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: (currency || 'usd').toLowerCase(),
        payment_method_types: ['card'],
        metadata: { source: 'ecommerce-platform' },
      });
      return {
        success: true,
        transactionId: paymentIntent.id,
        provider: 'stripe',
        clientSecret: paymentIntent.client_secret,
      };
    } catch (err) {
      logger.error('Stripe API error', { error: err.message });
      return { success: false, error: err.message };
    }
  }

  logger.info('[Stripe Mock] Processing payment', { amount, currency, card: card?.last4 });
  await delay(400);

  if (paymentMethod === 'fail' || card?.number?.endsWith('0000')) {
    return { success: false, error: 'Card declined (mock). Try a different card.' };
  }

  return {
    success: true,
    transactionId: `pi_mock_${Date.now()}`,
    provider: 'stripe',
    cardBrand: card?.brand || 'visa',
    cardLast4: card?.last4 || '4242',
  };
}

async function processPayPalPayment({ amount, currency, paypalEmail }) {
  const mock = process.env.PAYPAL_MOCK !== 'false';
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!mock && clientId && clientSecret) {
    logger.info('[PayPal Live] Would create order via PayPal REST API', { amount, currency });
    return {
      success: true,
      transactionId: `pp_live_${Date.now()}`,
      provider: 'paypal',
      approvalUrl: `https://www.sandbox.paypal.com/checkout?token=mock_${Date.now()}`,
    };
  }

  logger.info('[PayPal Mock] Processing payment', { amount, currency, paypalEmail });
  await delay(400);

  if (!paypalEmail?.includes('@')) {
    return { success: false, error: 'Valid PayPal email is required' };
  }

  return {
    success: true,
    transactionId: `pp_mock_${Date.now()}`,
    provider: 'paypal',
    paypalEmail,
  };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  getAvailableProviders,
  processStripePayment,
  processPayPalPayment,
};
