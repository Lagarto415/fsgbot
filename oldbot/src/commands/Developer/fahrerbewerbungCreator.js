const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const loadSettings = require('../../functions/loadSettings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-fahrerbewerbung')
        .setDescription('Fahrerbewerbung Panel erstellen'),

    async execute(interaction, client) {
        const file = new AttachmentBuilder('./src/images/formular.png');
        const applychannel = client.channels.cache.get(loadSettings(interaction.guildId).channels.numberchannel);
        const initialEmbed = new EmbedBuilder()
            .setColor(0xae00ff)
            .setTitle('Als Fahrer bewerben')
            .setDescription(`Hier kannst du dich als Fahrer bewerben.\n Sieh dir vorher die freien Fahrernummern bei ${applychannel} an.`)
            .setThumbnail('attachment://formular.png');

        const initialRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Success)
                    .setLabel('Bewerben')
                    .setCustomId('application')
            );

        await interaction.channel.send({ embeds: [initialEmbed], components: [initialRow], files: [file] });
    }
};
