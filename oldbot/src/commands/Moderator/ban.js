const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, AttachmentBuilder } = require('discord.js')
const settings = require('../../settings.json')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('einen User bannen')
    .addUserOption(option => option.setName('user').setDescription('user').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('reason').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    
    async execute(interaction, client){
        const guildId = interaction.guildId
        const modlog = settings[guildId].channels.modlog
        const warningFile = new AttachmentBuilder('./src/images/warning.png');
        const channel = client.channels.cache.get(modlog)
        const targetUser = interaction.options.getUser('user')
        const reason = interaction.options.getString('reason') || 'no reason provided'

        const memberToKick = interaction.guild.members.cache.get(targetUser.id);
        if (!memberToKick) {
            return await interaction.reply({ content: 'User kann nicht gebannt werden', ephemeral: true });
        }

        const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle(`${targetUser.tag} wurde gebannt`)
        .setThumbnail('attachment://warning.png')
        .setDescription(`Von: ${interaction.user}\nGrund: ${reason}`)
        .setTimestamp();

        await memberToKick.ban({reason});
        await interaction.reply({ content: `${targetUser.tag} wurde gebannt.`, ephemeral: true });
        await channel.send({ embeds: [embed], files: [warningFile] });
    }
}