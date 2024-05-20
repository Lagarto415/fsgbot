const { SlashCommandBuilder } = require("discord.js");
const fetchDataFromBackend = require("../../functions/dataClient");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getdbdata')
        .setDescription('Print all DB Data'),

    async execute(interaction) {
        const allData = await fetchDataFromBackend();
        const dataString = JSON.stringify(allData);
        const maxMessageLength = 1900; // A safe limit considering JSON format overhead

        // Function to split string into chunks
        const splitString = (str, size) => {
            let numChunks = Math.ceil(str.length / size);
            let chunks = new Array(numChunks);
            for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
                chunks[i] = str.substr(o, size);
            }
            return chunks;
        }

        const messages = splitString(dataString, maxMessageLength);

        try {
            // Ensure we only reply once and follow up for the rest
            if (messages.length > 0) {
                await interaction.reply({ content: messages[0], ephemeral: false });
                for (let i = 1; i < messages.length; i++) {
                    await interaction.followUp({ content: messages[i], ephemeral: false });
                }
            } else {
                await interaction.reply({ content: 'No data available', ephemeral: true });
            }
        } catch (error) {
            console.error('Error sending messages:', error);
            await interaction.reply({ content: 'Failed to send data', ephemeral: true });
        }
    }
};
