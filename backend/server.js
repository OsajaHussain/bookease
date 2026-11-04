require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, database: 'connected' });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/owner', require('./routes/owner'));
app.use('/api/public', require('./routes/public'));
app.use('/api/customer', require('./routes/customer'));
app.use('/api/staff', require('./routes/staff'));

app.listen(process.env.PORT, () => {
  console.log('BookEase backend chal raha hai: http://localhost:' + process.env.PORT);
});