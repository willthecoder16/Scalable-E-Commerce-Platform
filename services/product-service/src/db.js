const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT || 5432),
  user: process.env.POSTGRES_USER || 'ecommerce',
  password: process.env.POSTGRES_PASSWORD || 'ecommerce_secret',
  database: process.env.POSTGRES_DB || 'product_db',
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id UUID PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      category_id UUID REFERENCES categories(id),
      image_url VARCHAR(500),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM products');
  if (rows[0].count === 0) {
    await seedData();
  }
}

async function seedData() {
  const { v4: uuidv4 } = require('uuid');
  const catId = uuidv4();
  await pool.query(
    'INSERT INTO categories (id, name, description) VALUES ($1, $2, $3)',
    [catId, 'Electronics', 'Electronic devices and accessories']
  );

  const products = [
    { name: 'Wireless Headphones', description: 'Noise-cancelling over-ear headphones', price: 149.99, stock: 50 },
    { name: 'Smart Watch', description: 'Fitness tracking smartwatch', price: 299.99, stock: 30 },
    { name: 'USB-C Hub', description: '7-in-1 USB-C adapter', price: 49.99, stock: 100 },
    { name: 'Mechanical Keyboard', description: 'RGB mechanical gaming keyboard', price: 129.99, stock: 40 },
    { name: 'Portable Charger', description: '20000mAh power bank', price: 39.99, stock: 75 },
  ];

  for (const p of products) {
    await pool.query(
      `INSERT INTO products (id, name, description, price, stock, category_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), p.name, p.description, p.price, p.stock, catId]
    );
  }
}

module.exports = { pool, initDb };
