const fs = require('fs');
const path = require('path');

module.exports = () => {
    const settingsFilePath = path.join(__dirname, '../data/tracks.json');
    try {
        const settings = JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8') || '{}');
        return settings || {};
    } catch (error) {
        console.error("Error loading settings:", error);
        return {};
    }
}