require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev'
});

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

app.post('/api/post-activity', (req, res) => {
  // データ受け取り＆挿入
});

app.listen(3000, () => {
  console.log(`API server running on http://localhost:3000 using DB: ${process.env.DB_NAME}`);
});
