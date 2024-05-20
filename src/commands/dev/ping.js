const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Ping the Bot'),

    async execute(interaction, client) {
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
        const ping = sent.createdTimestamp - interaction.createdTimestamp;

        const embed = new EmbedBuilder()
            .setTitle('PONG!')
            .addFields({ name: 'Ping:', value: `${ping} ms` })
            .setTimestamp()
            .setFooter({ text: 'Ping' });

        await interaction.editReply({ content: null, embeds: [embed], ephemeral: false });
    }
}