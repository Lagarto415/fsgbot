const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3000; // Choose your desired port

// PostgreSQL connection configuration
const pool = new Pool({
    user: 'postgres',
    host: '185.166.39.80',
    database: 'postgres',
    password: 'admin',
    port: 5432
});

// Define API endpoints
app.get('/api/data', (req, res) => {
    pool.query('SELECT * FROM "Fahrer"."Fahrer"', (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(results.rows);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});