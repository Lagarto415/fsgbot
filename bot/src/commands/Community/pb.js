const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('profilepicture')
    .setDescription('Get a users profilepicture')
    .addUserOption(option => option.setName('user').setDescription('user').setRequired(true)),

    async execute (interaction){
        const targetUser = interaction.options.getUser('user')
        const userAvatarURL = targetUser.displayAvatarURL({ format: 'png', dynamic: true, size: 512})

        await interaction.reply({files: [userAvatarURL]})
        .then(() => console.log(`Sent the ${targetUser.name} profile picture ${interaction.user.name}`))
    }
}