const fetchDataFromBackend = require("./dataClient");
const loadSettings = require("./loadSettings");

// This module exports a function that returns another function expecting a guildId
module.exports = (client) => {
    return async (guildId) => {
        const settings = loadSettings(guildId);
        const numberchannelId = settings.channels.numberchannel;
        const numberchannel = client.channels.cache.get(numberchannelId);
        
        if (!numberchannel) {
            console.error('Number channel not found');
            return;
        }

        const allData = (await fetchDataFromBackend()).data;
        let numberMessage = '';
        for (const driver of allData) {
            if (driver.displayName == null) {
                numberMessage += `${driver.driverNumber}: \n`;
            } else if (driver.displayName === 'X') {
                numberMessage += `${driver.driverNumber}: ❌\n`;
            } else {
                numberMessage += `${driver.driverNumber}: <@${driver.discordId}>\n`;
            }
        }

        try {
            const messageId = settings.messages.numbers;
            const messageToEdit = await numberchannel.messages.fetch(messageId);
            await messageToEdit.edit(numberMessage);
            console.log('NumberMessage updated successfully.');
        } catch (error) {
            console.error('Error fetching or editing the message:', error);
        }
    };
};
