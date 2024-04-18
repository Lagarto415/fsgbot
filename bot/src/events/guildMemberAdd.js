const { EmbedBuilder } = require("discord.js");
const fs = require('fs');
const path = require('path');
const loadSettings = require('../functions/loadSettings');

module.exports = {
    name: 'guildMemberAdd',
    async execute (client) {
        console.log("New member joined!");

        const guildSettings = loadSettings(client.guild.id);
        const welcomeChannelId = guildSettings.welcome;

        const BewerberRole = guildSettings.bewerber;

        const channel = await client.guild.channels.fetch(welcomeChannelId).catch(console.error);
        const rulesChannel = await client.guild.channels.fetch(guildSettings.rules);
        const bewerberChannel = await client.guild.channels.fetch(guildSettings.driver_application);

        if (!channel) {
            console.log("Welcome channel not found.");
            return;
        }

        const embed = new EmbedBuilder()
        .setTitle("Willkommen in der FSG!")
        .setDescription(`Hallo ${client.user.displayName}, bitte schaue dir die ${rulesChannel} an und bewirb dich als Fahrer unter ${bewerberChannel}.`)
        .setThumbnail(client.user.displayAvatarURL())
        .setTimestamp()

        client.roles.add(BewerberRole)

        if (channel) await channel.send({ embeds: [embed], content: `${client.user}` });
    }
}