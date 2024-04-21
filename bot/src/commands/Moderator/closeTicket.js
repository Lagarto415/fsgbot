const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, AttachmentBuilder } = require('discord.js')
const loadSettings = require('../../functions/loadSettings');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('close')
    .setDescription('Close the ticket'),

    async execute(interaction, client) {
        const warningFile = new AttachmentBuilder('./src/images/warning.png');
        const settings = loadSettings(interaction.guildId);
        const ModLog =  client.channels.cache.get(settings.channels.modlog);
        if (interaction.channel.parent == loadSettings(interaction.guild.id).categories.ticketCategory) {
            const ticketChannel = interaction.channel;

            if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
                return interaction.reply({ content: "You don't have permission to manage this ticket channel!", ephemeral: true });
            } 

            try {
                const embed = new EmbedBuilder()
                .setColor(0xff1100)
                .setTitle("Ticket geschlossen")
                .setDescription(`Ticket: ${ticketChannel.name}\nVon: ${interaction.user}`)
                .setThumbnail('attachment://warning.png')
                .setTimestamp()
                ModLog.send({embeds: [embed], files: [warningFile]});
                ticketChannel.delete();
            } catch (err) {
                console.error("Error removing user from ticket:", err);
                await interaction.reply({ content: "An error occurred while removing the user.", ephemeral: true });
            }    
        }
    }
}