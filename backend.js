const mysql = require('mysql2');

// MySQL connection configuration
const pool = mysql.createPool({
  host: '185.166.39.80',
  user: 'root',
  database: 'fsg',
  password: 'otto1.',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

// Express app setup (assuming you have already installed and imported express)
const express = require('express');
const app = express();
const port = 3000; // The port your Express server will listen on

// Define API endpoints
app.get('/api/data', async (req, res) => {
    try {
        const [results, fields] = await pool.query('SELECT * FROM fsgTable');
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
