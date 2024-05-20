const { SlashCommandBuilder } = require("discord.js");
const getData = require("../../modules/getData");
const getGuild = require("../../modules/getGuild");
const setMessageId = require("../../modules/setMessageId");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-numbermessage')
        .setDescription('Erstellt die NumberMessage'),

    async execute(interaction, client) {
        const allData = await getData()
        const GuildData = await getGuild(interaction.guildId)
        const numberchannel = client.channels.cache.get(GuildData.data.numbers);
        let numberMessage = '';

        for (let i = 1; i <= 99; i++) {
            const driver = allData.find(d => d.number === i);
            if (!driver || driver.available === 0) {
                numberMessage += `**${i}:** ❌\n`;
            } else if (driver.driver_name === null) {
                numberMessage += `**${driver.number}:** 🆓\n`;
            } else {
                try {
                    numberMessage += `**${driver.number}:** <@${driver.discordId}>\n`;
                } catch (err) {
                    console.log("User not found");
                }
            }
        }

        await numberchannel.send(numberMessage);
        await setMessageId({messageId: numberchannel.lastMessageId, guildId: interaction.guildId});
        await interaction.reply({ content: 'NumberMessage erstellt', ephemeral: true });
    }
}