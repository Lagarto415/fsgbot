const fs = require('fs');
const path = require('path');

module.exports = () => {
    const settingsFilePath = path.join(__dirname, '../data/numbersTaken.json');
    try {
        const settings = JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8') || '{}');
        const falseValues = Object.entries(settings)
            .filter(([key, value]) => value === false)
            .reduce((obj, [key, value]) => {
                obj[key] = value;
                return obj;
            }, {});
        return falseValues;
    } catch (error) {
        console.error("Error loading settings:", error);
        return {};
    }
}
