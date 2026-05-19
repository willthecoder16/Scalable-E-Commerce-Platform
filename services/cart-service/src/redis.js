const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT || 6379),
  maxRetriesPerRequest: 3,
});

const CART_TTL = 60 * 60 * 24 * 7; // 7 days

function cartKey(userId) {
  return `cart:${userId}`;
}

async function getCart(userId) {
  const data = await redis.get(cartKey(userId));
  return data ? JSON.parse(data) : { userId, items: [], updatedAt: new Date().toISOString() };
}

async function saveCart(cart) {
  cart.updatedAt = new Date().toISOString();
  await redis.set(cartKey(cart.userId), JSON.stringify(cart), 'EX', CART_TTL);
  return cart;
}

module.exports = { redis, getCart, saveCart };
