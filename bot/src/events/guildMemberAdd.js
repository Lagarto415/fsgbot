const { EmbedBuilder } = require("discord.js");
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'guildMemberAdd',
    async execute (client) {
        console.log("New member joined!");

        const guildSettings = loadSettings(client.guild.id);
        const welcomeChannelId = guildSettings.welcome;

        const channel = await client.guild.channels.fetch(welcomeChannelId).catch(console.error);

        if (!channel) {
            console.log("Welcome channel not found.");
            return;
        }

        const embed = new EmbedBuilder()
        .setTitle("Willkommen!")
        .setDescription(`Hallo <@${client.user.id}>, schön das du da bist!`)
        .setThumbnail(client.user.displayAvatarURL())
        .setTimestamp()
        .setFooter({ text: 'Joined' });

        if (channel) channel.send({ embeds: [embed] });
    }
}

function loadSettings(guildId) {
    const settingsFilePath = path.join(__dirname, '../settings.json');
    try {
        const settings = JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8') || '{}');
        return settings[guildId] || {};
    } catch (error) {
        console.error("Error loading settings:", error);
        return {};
    }
}