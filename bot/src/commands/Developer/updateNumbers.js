const { SlashCommandBuilder } = require("discord.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName('updatenumbers')
        .setDescription('Update the Numbermessage'),

    async execute(interaction, client) {
        const updateNumbermessage = require("../../functions/updateNumbermessage")(client);
        updateNumbermessage(interaction.guild.id);

        await interaction.reply({ content: 'Numbers updated', ephemeral: true });
    }
}