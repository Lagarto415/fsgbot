const fs = require('fs');
const path = require('path');


module.exports = (guildId) => {
    const settingsFilePath = path.join(__dirname, '../settings.json');
    try {
        const settings = JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8') || '{}');
        return settings[guildId] || {};
    } catch (error) {
        console.error("Error loading settings:", error);
        return {};
    }
}