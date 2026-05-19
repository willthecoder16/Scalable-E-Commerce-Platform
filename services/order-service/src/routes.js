const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('./db');
const { getCart, clearCart, reserveInventory } = require('./clients');

const ORDER_STATUSES = ['pending', 'confirmed', 'paid', 'shipped', 'delivered', 'cancelled'];

function createRoutes(publishEvent) {
  const router = express.Router();

  router.post('/', async (req, res, next) => {
    const client = await pool.connect();
    try {
      const { userId, shippingAddress } = req.body;
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const cart = await getCart(userId);
      if (!cart.items?.length) {
        return res.status(400).json({ error: 'Cart is empty' });
      }

      await client.query('BEGIN');

      const orderId = uuidv4();
      const total = cart.total ?? cart.items.reduce((s, i) => s + i.price * i.quantity, 0);

      await client.query(
        `INSERT INTO orders (id, user_id, status, total, shipping_address)
         VALUES ($1, $2, 'pending', $3, $4)`,
        [orderId, userId, total, JSON.stringify(shippingAddress || {})]
      );

      for (const item of cart.items) {
        await reserveInventory(item.productId, item.quantity);
        await client.query(
          `INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [uuidv4(), orderId, item.productId, item.name, item.quantity, item.price]
        );
      }

      await client.query('COMMIT');
      await clearCart(userId);

      const order = await fetchOrder(orderId);
      await publishEvent('order.created', {
        orderId,
        userId,
        total,
        email: req.body.email,
        phone: req.body.phone,
      });

      res.status(201).json({ order });
    } catch (err) {
      await client.query('ROLLBACK');
      next(err);
    } finally {
      client.release();
    }
  });

  router.get('/user/:userId', async (req, res, next) => {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
        [req.params.userId]
      );
      const orders = await Promise.all(rows.map((r) => fetchOrder(r.id)));
      res.json({ orders });
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const order = await fetchOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json({ order });
    } catch (err) {
      next(err);
    }
  });

  router.patch('/:id/status', async (req, res, next) => {
    try {
      const { status } = req.body;
      if (!ORDER_STATUSES.includes(status)) {
        return res.status(400).json({ error: `status must be one of: ${ORDER_STATUSES.join(', ')}` });
      }

      const { rows } = await pool.query(
        `UPDATE orders SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
        [req.params.id, status]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const order = await fetchOrder(req.params.id);
      await publishEvent('order.status.updated', {
        orderId: order.id,
        userId: order.userId,
        status,
        email: req.body.email,
      });

      res.json({ order });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

async function fetchOrder(orderId) {
  const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
  if (rows.length === 0) return null;

  const { rows: items } = await pool.query(
    'SELECT * FROM order_items WHERE order_id = $1',
    [orderId]
  );

  const order = rows[0];
  return {
    id: order.id,
    userId: order.user_id,
    status: order.status,
    total: parseFloat(order.total),
    shippingAddress: order.shipping_address,
    paymentId: order.payment_id,
    items: items.map((i) => ({
      id: i.id,
      productId: i.product_id,
      productName: i.product_name,
      quantity: i.quantity,
      unitPrice: parseFloat(i.unit_price),
    })),
    createdAt: order.created_at,
    updatedAt: order.updated_at,
  };
}

module.exports = { createRoutes, fetchOrder };
