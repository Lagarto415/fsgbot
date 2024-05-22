const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-ticket-creator')
        .setDescription('Erstellt ein Ticket-erstellen Panel'),

    async execute(interaction) {
        const file = new AttachmentBuilder('./src/images/ticket.png');
        const initialEmbed = new EmbedBuilder()
            .setColor(0xae00ff)
            .setTitle('Ticket erstellen')
            .setDescription('Hier kannst du ein Ticket erstellen.')
            .setThumbnail('attachment://ticket.png');

        const initialRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setLabel('Ticket erstellen')
                    .setCustomId('ticket-init')
            );

        await interaction.channel.send({ embeds: [initialEmbed], components: [initialRow], files: [file] });
    }
};
