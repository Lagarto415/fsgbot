const { SlashCommandBuilder } = require("discord.js");
const fetchDataFromBackend = require("../../functions/dataClient");
const loadSettings = require("../../functions/loadSettings");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-numbermessage')
        .setDescription('Erstellt die NumberMessage'),

    async execute(interaction, client) {
        const allData = (await fetchDataFromBackend()).data
        const numberchannel = client.channels.cache.get(loadSettings(interaction.guildId).channels.numberchannel);
        let numberMessage = '';

        for (const drivers of allData) {
            if(drivers.displayName == null) {
                numberMessage += `${drivers.driverNumber}: \n`;
            }
            else if(drivers.displayName == 'X'){
                numberMessage += `${drivers.driverNumber}: ❌\n`;
            }
            else {
                try{
                    numberMessage += `${drivers.driverNumber}: <@${drivers.discordId}>\n`;
                }
                catch(err){
                    console.log("User not found")
                }
            }
            console.log('NumberMessage: ' + numberMessage);
        }

        await numberchannel.send(numberMessage);
        await interaction.reply({ content: 'NumberMessage erstellt', ephemeral: true });
    }
}