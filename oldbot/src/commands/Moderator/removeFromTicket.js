const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const loadSettings = require('../../functions/loadSettings');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Entfernt einen User aus dem Ticket')
    .addUserOption(option => option.setName('user').setDescription('user').setRequired(true)),

    async execute(interaction, client) {

    if (interaction.channel.parent == loadSettings(interaction.guild.id).categories.ticketCategory) {
        const userToRemove = interaction.options.getUser('user');
        const ticketChannel = interaction.channel;

        // Error Handling
        if (!ticketChannel.isTextBased()) { 
            return interaction.reply({ content: "ERROR: This command can only be used in a ticket channel!", ephemeral: true });
        }

        if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({ content: "ERROR: Du darfst den Command nicht benutzen", ephemeral: true });
        } 

        try {
            await ticketChannel.permissionOverwrites.edit(userToRemove, {
                ViewChannel: false, 
                SendMessages: false,
                ReadMessageHistory: false
            });

            await interaction.reply({ content: `${userToRemove} wurde aus dem Ticket entfernt.`, ephemeral: false });

        } catch (err) {
            console.error("Error removing user from ticket:", err);
            await interaction.reply({ content: "An error occurred while removing the user: " + err, ephemeral: true });
        }    
    }
    else {
        interaction.reply({ content: "Du kannst den Command nur in Tickets benutzen", ephemeral: true})
    }
    }
}