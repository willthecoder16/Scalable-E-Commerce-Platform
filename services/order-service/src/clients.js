const axios = require('axios');

const PRODUCT_URL = process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002';
const CART_URL = process.env.CART_SERVICE_URL || 'http://cart-service:3003';

async function getCart(userId) {
  const { data } = await axios.get(`${CART_URL}/api/cart/${userId}`);
  return data.cart;
}

async function clearCart(userId) {
  await axios.delete(`${CART_URL}/api/cart/${userId}`);
}

async function reserveInventory(productId, quantity) {
  await axios.patch(`${PRODUCT_URL}/api/products/${productId}/inventory`, {
    quantity: -Math.abs(quantity),
  });
}

module.exports = { getCart, clearCart, reserveInventory };
