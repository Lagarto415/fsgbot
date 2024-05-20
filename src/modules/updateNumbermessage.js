const getData = require("./getData");
const getGuild = require("./getGuild");

module.exports = async (client, guildId) => {
    try {
        const GuildData = await getGuild(guildId);
        
        if (!GuildData || !GuildData.numbers) {
            console.error('Guild data or number channel not found');
            return;
        }


        const numberchannel = client.channels.cache.get(GuildData.numbers);
        
        if (!numberchannel) {
            console.error('Number channel not found');
            return;
        }

        const allData = await getData();
        let numberMessage = '';
        for (let i = 1; i <= 99; i++) {
            const driver = allData.find(d => d.number === i);
            if (!driver || driver.available === 0) {
                numberMessage += `**${i}:** ❌\n`;
            } else if (driver.discordId === null) {
                numberMessage += `**${driver.number}:** 🆓\n`;
            } else {
                try {
                    numberMessage += `**${driver.number}:** <@${driver.discordId}>\n`;
                } catch (err) {
                    console.log("User not found");
                }
            }
        }

        const messageId = GuildData.numberMessage;
        if (!messageId) {
            console.error('Number message ID not found in GuildData');
            return;
        }

        try {
            const messageToEdit = await numberchannel.messages.fetch(messageId);
            await messageToEdit.edit(numberMessage);
            console.log('NumberMessage updated successfully.');
        } catch (error) {
            console.error('Error fetching or editing the message:', error);
        }
    } catch (error) {
        console.error('Failed to update number message:', error);
    }
};
