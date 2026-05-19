const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('./db');
const { processStripePayment, processPayPalPayment } = require('./providers');

function createRoutes(publishEvent) {
  const router = express.Router();

  router.post('/process', async (req, res, next) => {
    try {
      const { orderId, userId, amount, provider = 'stripe', currency = 'USD', paymentMethod } = req.body;

      if (!orderId || !userId || amount == null) {
        return res.status(400).json({ error: 'orderId, userId, and amount are required' });
      }

      const paymentId = uuidv4();
      await pool.query(
        `INSERT INTO payments (id, order_id, user_id, amount, currency, provider, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'processing')`,
        [paymentId, orderId, userId, amount, currency, provider]
      );

      const processor = provider === 'paypal' ? processPayPalPayment : processStripePayment;
      const result = await processor({ amount, currency, paymentMethod });

      if (!result.success) {
        await pool.query(
          `UPDATE payments SET status = 'failed', updated_at = NOW() WHERE id = $1`,
          [paymentId]
        );
        return res.status(402).json({ error: result.error || 'Payment failed', paymentId });
      }

      await pool.query(
        `UPDATE payments SET status = 'completed', transaction_id = $2, updated_at = NOW() WHERE id = $1`,
        [paymentId, result.transactionId]
      );

      await publishEvent('payment.completed', {
        paymentId,
        orderId,
        userId,
        amount,
        transactionId: result.transactionId,
        provider: result.provider,
      });

      res.json({
        payment: {
          id: paymentId,
          orderId,
          status: 'completed',
          transactionId: result.transactionId,
          provider: result.provider,
        },
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/order/:orderId', async (req, res, next) => {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC',
        [req.params.orderId]
      );
      res.json({
        payments: rows.map(formatPayment),
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const { rows } = await pool.query('SELECT * FROM payments WHERE id = $1', [req.params.id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      res.json({ payment: formatPayment(rows[0]) });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

function formatPayment(row) {
  return {
    id: row.id,
    orderId: row.order_id,
    userId: row.user_id,
    amount: parseFloat(row.amount),
    currency: row.currency,
    provider: row.provider,
    status: row.status,
    transactionId: row.transaction_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = { createRoutes };
