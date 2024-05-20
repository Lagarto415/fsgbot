const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.DBPORT || 3000; // Default to 3000 if DBPORT is not set

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

module.exports = {
  name: 'backend',
  once: true,

  async execute() {
    app.get('/fsg/tracks', async (req, res) => {
      try {
        const [results] = await pool.query('SELECT * FROM tracks');
        
        if (results.length === 0) {
          console.log('No tracks found.'); // Log if no results
        }

        const transformedResponse = results.reduce((acc, track) => {
          acc[track.Country] = {
            emoji: track.Emoji,
            trackImage: track.TrackImage
          };
          return acc;
        }, {});

        res.json(transformedResponse);
      } catch (error) {
        console.error('Failed to retrieve tracks:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
    
    // Additional route handlers for other endpoints
    app.get('/fsg/data', async (req, res) => {
      const sql = `SELECT
          driver.number,
          driver.discordId,
          driver.available,
          driver.name AS driver_name,
          team.name AS team_name,
          team.roleId
      FROM 
          driver
      LEFT JOIN 
          team ON driver.teamId = team.id
      ORDER BY
          driver.number;
      `;
      try {
        const [results] = await pool.query(sql);
        res.json(results);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
    
    app.get('/fsg/:guildId', async (req, res) => {
      const { guildId } = req.params;
      try {
        const [results] = await pool.query('SELECT * FROM guild WHERE guildId = ?', [guildId]);
        res.json(results[0]);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
    
    app.put('/fsg/numberId/:messageId', async (req, res) => {
      const { messageId } = req.params;
      const { guildId } = req.body;
      try {
        const [results] = await pool.query('UPDATE guild SET numberMessage = ? WHERE guildId = ?', [messageId, guildId]);
        res.json(results);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
    
    app.put('/fsg/update/:number', async (req, res) => {
      const { number } = req.params;
      const { name, discordId, team } = req.body;
    
      if (!name || !discordId || !team) {
        return res.status(400).json({ error: 'Name, Discord ID, and Team are required.' });
      }
    
      const normalizedTeamName = normalizeTeamName(team);
    
      try {
        const [teamRows] = await pool.query(
          `SELECT id FROM team WHERE REPLACE(name, ' ', '') = ?`,
          [normalizedTeamName]
        );
    
        if (teamRows.length === 0) {
          return res.status(404).json({ error: 'Team not found.' });
        }
    
        const teamId = teamRows[0].id;
    
        const [result] = await pool.query(
          `UPDATE driver SET name = ?, discordId = ?, teamId = ? WHERE number = ?`,
          [name, discordId, teamId, number]
        );
    
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Driver not found.' });
        }
    
        res.json({ message: 'Driver updated successfully.' });
      } catch (error) {
        console.error('Failed to update driver:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
    
    const normalizeTeamName = (string) => {
      return string.replace(/\s+/g, '').charAt(0).toUpperCase() + string.replace(/\s+/g, '').slice(1).toLowerCase();
    };
    
    app.get('/fsg/isFree/:teamName', async (req, res) => {
      let { teamName } = req.params;
      teamName = normalizeTeamName(teamName);
    
      if (teamName === "Ersatzfahrer" || teamName === "Kommentator") {
        return res.send(true);
      }
    
      try {
        const [rows] = await pool.query(
          `SELECT 
              team.name AS team_name,
              COUNT(driver.number) AS driverCount
           FROM 
              driver
           JOIN 
              team ON driver.teamId = team.id
           WHERE 
              REPLACE(team.name, ' ', '') = ?
           GROUP BY 
              team.name`,
          [teamName]
        );
    
        if (rows.length === 0) {
          return res.send(true);
        }
    
        const driverCount = rows[0].driverCount;
        res.send(driverCount < 2);
      } catch (error) {
        console.error('Failed to retrieve team count:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
    
    app.put('/fsg/setup/:guildId', async (req, res) => {
      const { guildId } = req.params;
      const { welcome, leave, modLog, socials, rules, application, numbers } = req.body;
      const sql = `UPDATE guild SET 
        welcome = ?,
        \`leave\` = ?,
        modLog = ?, 
        social = ?, 
        rules = ?, 
        application = ?, 
        numbers = ?
        WHERE guildId = ?`;
      try {
        const [result] = await pool.query(sql, [welcome, leave, modLog, socials, rules, application, numbers, guildId]);
        res.send(result);
      } catch (error) {
        console.error('Failed to setup guild:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
    
    
    app.listen(port, () => {
      console.log(`Backend server running on http://localhost:${port}/fsg/`);
    });
    
    process.on('uncaughtException', (err) => {
      console.error('There was an uncaught error', err);
    });
}}
