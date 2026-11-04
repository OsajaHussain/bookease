const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  timezone: '+05:00',
  waitForConnections: true,
  connectionLimit: 3,
  enableKeepAlive: true,
});

// har naye connection par database ka waqt Pakistan ka kar do
pool.pool.on('connection', (conn) => {
  conn.query("SET time_zone = '+05:00'");
});

module.exports = pool;