require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const FILES = ['schema.sql', 'schema_requests.sql'];

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    multipleStatements: true,
  });

  for (const f of FILES) {
    const sql = fs.readFileSync(path.join(__dirname, f), 'utf8');
    await conn.query(sql);
    console.log('Ran', f);
  }

  console.log('Done: all tables are ready on', process.env.DB_HOST);
  await conn.end();
})().catch((e) => {
  console.error('Failed:', e.message);
  process.exit(1);
});