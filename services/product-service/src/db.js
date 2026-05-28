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

  const categories = [
    { name: 'Audio', description: 'Headphones, earbuds, and speakers' },
    { name: 'Wearables', description: 'Smartwatches and fitness trackers' },
    { name: 'Computers', description: 'Laptops, tablets, and monitors' },
    { name: 'Accessories', description: 'Cables, hubs, chargers, and more' },
    { name: 'Gaming', description: 'Consoles, controllers, and gear' },
    { name: 'Cameras', description: 'Cameras, lenses, and capture gear' },
    { name: 'Smart Home', description: 'Connected home devices' },
    { name: 'Home Office', description: 'Desks, chairs, and productivity tools' },
  ];

  const catIds = {};
  for (const c of categories) {
    const id = uuidv4();
    catIds[c.name] = id;
    await pool.query(
      'INSERT INTO categories (id, name, description) VALUES ($1, $2, $3)',
      [id, c.name, c.description]
    );
  }

  const products = [
    // Audio
    { name: 'Aurora Wireless Headphones', description: 'Over-ear active noise-cancelling headphones with 40h battery life.', price: 199.99, stock: 60, category: 'Audio' },
    { name: 'Pulse Pro Earbuds', description: 'True wireless earbuds with adaptive ANC and wireless charging case.', price: 129.99, stock: 120, category: 'Audio' },
    { name: 'BoomBox Mini Speaker', description: 'Compact Bluetooth speaker with 360° sound and IPX7 waterproofing.', price: 59.99, stock: 80, category: 'Audio' },
    { name: 'Studio Monitor Speakers', description: 'Pair of 5" powered studio monitors for crisp, flat reference sound.', price: 249.99, stock: 25, category: 'Audio' },
    { name: 'Vinyl Turntable Classic', description: 'Belt-drive turntable with built-in preamp and USB recording.', price: 179.99, stock: 18, category: 'Audio' },

    // Wearables
    { name: 'Pace Smart Watch', description: 'GPS fitness smartwatch with heart-rate, SpO2, and 7-day battery.', price: 299.99, stock: 45, category: 'Wearables' },
    { name: 'FitBand Active', description: 'Slim activity tracker with sleep tracking and 14-day battery.', price: 79.99, stock: 150, category: 'Wearables' },
    { name: 'Sprint Running Watch', description: 'Lightweight multisport watch with advanced running metrics.', price: 219.99, stock: 30, category: 'Wearables' },

    // Computers
    { name: 'Nova UltraBook 14', description: '14" ultralight laptop, 16GB RAM, 512GB SSD, all-day battery.', price: 1099.99, stock: 22, category: 'Computers' },
    { name: 'Slate Pro Tablet', description: '11" tablet with stylus support and laminated 120Hz display.', price: 649.99, stock: 40, category: 'Computers' },
    { name: 'VisionView 27" Monitor', description: '27" 4K USB-C monitor with 99% sRGB and height-adjustable stand.', price: 379.99, stock: 35, category: 'Computers' },
    { name: 'Curve 34 Ultrawide', description: '34" ultrawide 144Hz monitor for immersive multitasking.', price: 529.99, stock: 16, category: 'Computers' },

    // Accessories
    { name: '7-in-1 USB-C Hub', description: 'HDMI 4K, dual USB-A, SD/microSD, and 100W passthrough charging.', price: 49.99, stock: 200, category: 'Accessories' },
    { name: 'PowerCell 20K Charger', description: '20,000mAh power bank with 65W USB-C fast charging.', price: 45.99, stock: 90, category: 'Accessories' },
    { name: 'Braided USB-C Cable (2m)', description: 'Durable 100W braided cable rated for 10,000+ bends.', price: 14.99, stock: 300, category: 'Accessories' },
    { name: 'MagSafe Wireless Pad', description: '15W magnetic wireless charger with anti-slip base.', price: 34.99, stock: 110, category: 'Accessories' },
    { name: 'Travel Adapter Universal', description: 'All-in-one travel plug for 150+ countries with dual USB.', price: 24.99, stock: 140, category: 'Accessories' },

    // Gaming
    { name: 'Titan Mechanical Keyboard', description: 'Hot-swappable RGB mechanical keyboard with tactile switches.', price: 129.99, stock: 55, category: 'Gaming' },
    { name: 'Apex Gaming Mouse', description: 'Lightweight 26K DPI wireless mouse with 70h battery.', price: 69.99, stock: 85, category: 'Gaming' },
    { name: 'Nebula Controller', description: 'Wireless pro controller with hall-effect sticks and back paddles.', price: 89.99, stock: 60, category: 'Gaming' },
    { name: 'Immersion Gaming Headset', description: '7.1 surround headset with detachable mic and memory-foam pads.', price: 99.99, stock: 50, category: 'Gaming' },

    // Cameras
    { name: 'Snap Mirrorless Camera', description: '24MP mirrorless camera with 4K60 video and in-body stabilization.', price: 899.99, stock: 14, category: 'Cameras' },
    { name: 'Voyager Action Cam', description: 'Rugged 5K action camera, waterproof to 10m, with stabilization.', price: 329.99, stock: 38, category: 'Cameras' },
    { name: 'Aerial Drone Pro', description: 'Foldable 4K camera drone with 34-min flight time and obstacle sensing.', price: 759.99, stock: 12, category: 'Cameras' },
    { name: 'Streamer Webcam 4K', description: '4K webcam with autofocus, HDR, and dual noise-cancelling mics.', price: 119.99, stock: 70, category: 'Cameras' },

    // Smart Home
    { name: 'Hub Mini Smart Speaker', description: 'Voice assistant speaker with smart-home hub and room-filling audio.', price: 89.99, stock: 100, category: 'Smart Home' },
    { name: 'Aura Smart Bulb (4-pack)', description: 'Color-changing Wi-Fi LED bulbs with scenes and scheduling.', price: 49.99, stock: 130, category: 'Smart Home' },
    { name: 'Guardian Video Doorbell', description: '2K video doorbell with motion zones and two-way talk.', price: 159.99, stock: 42, category: 'Smart Home' },
    { name: 'Climate Smart Thermostat', description: 'Learning thermostat with energy reports and geofencing.', price: 199.99, stock: 33, category: 'Smart Home' },

    // Home Office
    { name: 'AeroDesk Standing Desk', description: 'Electric sit-stand desk with memory presets and cable tray.', price: 429.99, stock: 20, category: 'Home Office' },
    { name: 'ErgoChair Pro', description: 'Ergonomic mesh office chair with adjustable lumbar and armrests.', price: 289.99, stock: 28, category: 'Home Office' },
    { name: 'Halo Desk Lamp', description: 'LED desk lamp with wireless charging base and 5 color temps.', price: 54.99, stock: 95, category: 'Home Office' },
    { name: 'FocusPad Notebook Set', description: 'Set of 3 dotted-grid notebooks with premium 120gsm paper.', price: 19.99, stock: 220, category: 'Home Office' },
  ];

  for (const p of products) {
    await pool.query(
      `INSERT INTO products (id, name, description, price, stock, category_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), p.name, p.description, p.price, p.stock, catIds[p.category]]
    );
  }
}

module.exports = { pool, initDb };
