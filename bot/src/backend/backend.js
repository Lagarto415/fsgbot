// backend.js

const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const port = 3000; // Port where the backend server will listen

// MySQL connection configuration
const pool = mysql.createPool({
  host: '185.166.39.80',
  user: 'root',
  database: 'fsg',
  password: 'otto1.', // Remember to use environment variables for production
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Endpoint to get data from the database
app.get('/data', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM fsgTable');
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});

// Keep the process running
process.on('uncaughtException', (err) => {
  console.error('There was an uncaught error', err);
  // Handle the error safely
});