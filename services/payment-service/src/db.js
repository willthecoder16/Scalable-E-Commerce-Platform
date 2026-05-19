const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT || 5432),
  user: process.env.POSTGRES_USER || 'ecommerce',
  password: process.env.POSTGRES_PASSWORD || 'ecommerce_secret',
  database: process.env.POSTGRES_DB || 'payment_db',
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id UUID PRIMARY KEY,
      order_id UUID NOT NULL,
      user_id UUID NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      currency VARCHAR(3) DEFAULT 'USD',
      provider VARCHAR(50) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      transaction_id VARCHAR(255),
      metadata JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

module.exports = { pool, initDb };
