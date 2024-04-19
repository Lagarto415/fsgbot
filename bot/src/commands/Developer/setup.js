const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuO } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription("SETUP"),

    async execute(interaction) {
        const welcome = new StringSelectMenuBuilder()
        for (const channel of textChannels.values()) {
            welcome.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(channel.name)
                    .setValue(channel.id)
            );
        
            // Break the loop if we reach the maximum of 25 options
            if (selectMenu.options.length === 25) break;
        }
        



        const row1 = new ActionRowBuilder()
        .addComponents(welcome)

        interaction.reply(row1, welcom, welcome, welcome)

        
    }
}