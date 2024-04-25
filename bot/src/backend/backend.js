// backend.js

const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const app = express();
const port = 3000; // Port where the backend server will listen

app.use(bodyParser.json()); // Middleware to parse JSON bodies
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

app.put('/update-driver/:driverNumber', async (req, res) => {
  const { driverNumber } = req.params;
  const { displayName, team, discordId } = req.body;

  // Check if fields exist in the request body, not necessarily non-null
  if (displayName === undefined || team === undefined || discordId === undefined) {
    res.status(400).send('All fields (displayName, team, discordId) must be included, even if null.');
    return;
  }

  try {
    const [result] = await pool.query(
      'UPDATE fsgTable SET displayName = ?, team = ?, discordId = ? WHERE driverNumber = ?',
      [displayName, team, discordId, driverNumber]
    );

    if (result.affectedRows === 0) {
      res.status(404).send('Driver not found.');
    } else {
      res.send('Driver updated successfully.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating driver.');
  }
});

app.get('/team-count/:teamName', async (req, res) => {
  let { teamName } = req.params;
  teamName = capitalizeFirstLetter(teamName);

  if (teamName == "Ersatzfahrer" || teamName == "Kommentator") {
    res.send(true)
  }

  try {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS teamCount FROM fsgTable WHERE team = ?',
      [teamName]
    );
    const teamCount = rows[0].teamCount; // Access the count result
    res.send(teamCount < 2)
  } catch (error) {
    console.error('Failed to retrieve team count:', error);
    res.status(500).send({ error: 'Internal server error' });
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

function capitalizeFirstLetter(string) {
  if (!string) return string; // Return original string if it's empty or undefined
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
