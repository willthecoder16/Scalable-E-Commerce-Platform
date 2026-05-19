const express = require('express');
const { getCart, saveCart } = require('./redis');

const router = express.Router();

router.get('/:userId', async (req, res, next) => {
  try {
    const cart = await getCart(req.params.userId);
    res.json({ cart });
  } catch (err) {
    next(err);
  }
});

router.post('/:userId/items', async (req, res, next) => {
  try {
    const { productId, name, price, quantity = 1 } = req.body;
    if (!productId || price == null) {
      return res.status(400).json({ error: 'productId and price are required' });
    }

    const cart = await getCart(req.params.userId);
    const existing = cart.items.find((i) => i.productId === productId);

    if (existing) {
      existing.quantity += Number(quantity);
    } else {
      cart.items.push({
        productId,
        name: name || 'Product',
        price: Number(price),
        quantity: Number(quantity),
      });
    }

    cart.total = calculateTotal(cart.items);
    await saveCart(cart);
    res.json({ cart });
  } catch (err) {
    next(err);
  }
});

router.put('/:userId/items/:productId', async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (quantity == null || quantity < 0) {
      return res.status(400).json({ error: 'valid quantity is required' });
    }

    const cart = await getCart(req.params.userId);
    const item = cart.items.find((i) => i.productId === req.params.productId);

    if (!item) {
      return res.status(404).json({ error: 'Item not in cart' });
    }

    if (quantity === 0) {
      cart.items = cart.items.filter((i) => i.productId !== req.params.productId);
    } else {
      item.quantity = Number(quantity);
    }

    cart.total = calculateTotal(cart.items);
    await saveCart(cart);
    res.json({ cart });
  } catch (err) {
    next(err);
  }
});

router.delete('/:userId/items/:productId', async (req, res, next) => {
  try {
    const cart = await getCart(req.params.userId);
    cart.items = cart.items.filter((i) => i.productId !== req.params.productId);
    cart.total = calculateTotal(cart.items);
    await saveCart(cart);
    res.json({ cart });
  } catch (err) {
    next(err);
  }
});

router.delete('/:userId', async (req, res, next) => {
  try {
    const cart = { userId: req.params.userId, items: [], total: 0 };
    await saveCart(cart);
    res.json({ cart });
  } catch (err) {
    next(err);
  }
});

function calculateTotal(items) {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

module.exports = router;
