const { ModalBuilder, ActionRowBuilder, TextInputBuilder, SlashCommandBuilder, TextInputStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType, EmbedBuilder } = require("discord.js"); 
const loadTracks = require("../../functions/loadTracks");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('new-event')
    .setDescription('Create a new event'),

    async execute(interaction) {  
        const eventType = new StringSelectMenuBuilder()
        .setCustomId('event-type')
        .setPlaceholder('Testrennen oder Rennen')
        .addOptions(
            new StringSelectMenuOptionBuilder()
            .setLabel('Testrennen')
            .setDescription('Testrennen')
            .setValue('testrennen'),
            new StringSelectMenuOptionBuilder()
            .setLabel('Rennen')
            .setDescription('Rennen')
            .setValue('rennen')
        )
        
        const embed = new EmbedBuilder()
            .setTitle('Event erstellen')
            .setDescription('Hier kannst du ein Event erstellen. ')
            .setColor(0xff0000)
            .setTimestamp();

        const row1 = new ActionRowBuilder().addComponents(eventType) // Make sure eventType is a select menu (type 3)

        await interaction.reply({ embeds: [embed], components: [row1], ephemeral: true })
    }
}