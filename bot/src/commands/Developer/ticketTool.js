const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder, } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('create-ticket-creator')
    .setDescription('Create a ticket creator panel'),

    async execute(interaction) {
        const initialEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('Ticket erstellen')
        .setDescription('Hier kannst du ein Ticket erstellen.')

        const initialRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setLabel('Ticket erstellen')
            .setCustomId('ticket-init')
        )

        interaction.channel.send({ embeds: [initialEmbed], components: [initialRow] });
    }
}
