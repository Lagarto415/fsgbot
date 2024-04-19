const { EmbedBuilder } = require("discord.js");
const fs = require('fs');
const path = require('path');
const loadSettings = require("../functions/loadSettings");

module.exports = {
    name: 'guildMemberRemove',
    async execute (client) {
        console.log(`Member ${client.user.username} left the Server!`)


        const guildSettings = loadSettings(client.guild.id);
        const leaveChannelId = guildSettings.channels.goodbye;

        const channel = await client.guild.channels.fetch(leaveChannelId).catch(console.error);

        if (!channel) {
            console.log("Welcome channel not found.");
            return;
        }

        const embed = new EmbedBuilder()
        .setTitle('Bye bye')
        .setDescription(`Aufwiedersehen <@${client.user.id}>! Schön das du da warst!`)
        .setThumbnail(client.user.displayAvatarURL());

        if (channel) channel.send({ embeds: [embed] });
    }
}