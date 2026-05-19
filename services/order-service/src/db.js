const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT || 5432),
  user: process.env.POSTGRES_USER || 'ecommerce',
  password: process.env.POSTGRES_PASSWORD || 'ecommerce_secret',
  database: process.env.POSTGRES_DB || 'order_db',
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      total DECIMAL(10, 2) NOT NULL,
      shipping_address JSONB,
      payment_id UUID,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id UUID PRIMARY KEY,
      order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
      product_id UUID NOT NULL,
      product_name VARCHAR(255),
      quantity INTEGER NOT NULL,
      unit_price DECIMAL(10, 2) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

module.exports = { pool, initDb };
