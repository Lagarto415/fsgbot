const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const loadSettings = require('../../functions/loadSettings');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Remove User from the ticket')
    .addUserOption(option => option.setName('user').setDescription('user').setRequired(true)),

    async execute(interaction, client) {

    if (interaction.channel.parent == loadSettings(interaction.guild.id).ticketCategory) {
        const userToRemove = interaction.options.getUser('user');
        const ticketChannel = interaction.channel;

        // Error Handling
        if (!ticketChannel.isTextBased()) { 
            return interaction.reply({ content: "This command can only be used in a ticket channel!", ephemeral: true });
        }

        if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({ content: "You don't have permission to manage this ticket channel!", ephemeral: true });
        } 

        try {
            await ticketChannel.permissionOverwrites.edit(userToRemove, {
                ViewChannel: false, 
                SendMessages: false,
                ReadMessageHistory: false
            });

            await interaction.reply({ content: `${userToRemove} has been removed from the ticket.`, ephemeral: false });

        } catch (err) {
            console.error("Error removing user from ticket:", err);
            await interaction.reply({ content: "An error occurred while removing the user.", ephemeral: true });
        }    
    }
    else {
        interaction.reply({ content: "Cannot use command here", ephemeral: true})
    }
    }
}