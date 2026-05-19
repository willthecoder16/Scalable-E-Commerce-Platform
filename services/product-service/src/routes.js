const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('./db');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { category, search, limit = 50, offset = 0 } = req.query;
    let query = `
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      params.push(category);
      query += ` AND c.name ILIKE $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`;
    }

    params.push(Number(limit), Number(offset));
    query += ` ORDER BY p.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const { rows } = await pool.query(query, params);
    res.json({ products: rows.map(formatProduct) });
  } catch (err) {
    next(err);
  }
});

router.get('/categories/list', async (_req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json({
      categories: rows.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        createdAt: c.created_at,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/categories', async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }
    const id = uuidv4();
    const { rows } = await pool.query(
      'INSERT INTO categories (id, name, description) VALUES ($1, $2, $3) RETURNING *',
      [id, name, description]
    );
    res.status(201).json({ category: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Category already exists' });
    }
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ product: formatProduct(rows[0]) });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, description, price, stock, categoryId, imageUrl } = req.body;
    if (!name || price == null) {
      return res.status(400).json({ error: 'name and price are required' });
    }

    const id = uuidv4();
    const { rows } = await pool.query(
      `INSERT INTO products (id, name, description, price, stock, category_id, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [id, name, description, price, stock ?? 0, categoryId || null, imageUrl || null]
    );
    res.status(201).json({ product: formatProduct(rows[0]) });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { name, description, price, stock, categoryId, imageUrl } = req.body;
    const { rows } = await pool.query(
      `UPDATE products SET
         name = COALESCE($2, name),
         description = COALESCE($3, description),
         price = COALESCE($4, price),
         stock = COALESCE($5, stock),
         category_id = COALESCE($6, category_id),
         image_url = COALESCE($7, image_url),
         updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [req.params.id, name, description, price, stock, categoryId, imageUrl]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ product: formatProduct(rows[0]) });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/inventory', async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (quantity == null) {
      return res.status(400).json({ error: 'quantity is required' });
    }

    const { rows } = await pool.query(
      `UPDATE products SET stock = stock + $2, updated_at = NOW()
       WHERE id = $1 AND stock + $2 >= 0
       RETURNING *`,
      [req.params.id, Number(quantity)]
    );
    if (rows.length === 0) {
      return res.status(400).json({ error: 'Insufficient stock or product not found' });
    }
    res.json({ product: formatProduct(rows[0]) });
  } catch (err) {
    next(err);
  }
});

function formatProduct(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: parseFloat(row.price),
    stock: row.stock,
    categoryId: row.category_id,
    categoryName: row.category_name,
    imageUrl: row.image_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = router;
