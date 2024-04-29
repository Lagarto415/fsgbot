const { SlashCommandBuilder, ChannelSelectMenuBuilder, ChannelType, ActionRowBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup the channels'),

    async execute(interaction) {
        const selector1 = new ChannelSelectMenuBuilder()
            .setCustomId('selector1')
            .setPlaceholder('welcome')
            .setMinValues(1)
            .setMaxValues(1)
            .addChannelTypes(ChannelType.GuildText)

        const selector2 = new ChannelSelectMenuBuilder()
            .setCustomId('selector2')
            .setPlaceholder('goodbye')
            .setMinValues(1)
            .setMaxValues(1)
            .addChannelTypes(ChannelType.GuildText)

        

        const row = new ActionRowBuilder()
            .addComponents(selector1)
        const row2 = new ActionRowBuilder()
            .addComponents(selector2)

        interaction.reply({ content: 'Setup', components: [row, row2] })
    }
}