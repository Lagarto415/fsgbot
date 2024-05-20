const { SlashCommandBuilder} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('profilepicture')
    .setDescription('Get a users profilepicture')
    .addUserOption(option => option.setName('user').setDescription('user').setRequired(true)),

    async execute (interaction){
        await interaction.deferReply({ content: 'Lade Profilbild...', ephemeral: true })
        const targetUser = interaction.options.getUser('user')
        const userAvatarURL = targetUser.displayAvatarURL({ format: 'png', dynamic: true, size: 512})

        await interaction.editReply({files: [userAvatarURL]})
        .then(() => console.log(`Sent the ${targetUser.name} profile picture ${interaction.user.name}`))
    }
}