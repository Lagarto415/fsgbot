const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, AttachmentBuilder } = require('discord.js')
const settings = require('../../../oldbot/src/settings.json')


module.exports = {
    data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('einen User kicken')
    .addUserOption(option => option.setName('user').setDescription('user').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('reason').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    
    async execute(interaction, client){
        const guildId = interaction.guildId
        const warningFile = new AttachmentBuilder('./src/images/warning.png');
        const modlog = settings[guildId].channels.modlog
        const channel = client.channels.cache.get(modlog)
        const targetUser = interaction.options.getUser('user')
        const reason = interaction.options.getString('reason') || 'no reason provided'

        const memberToKick = interaction.guild.members.cache.get(targetUser.id);
        if (!memberToKick) {
            return await interaction.reply({ content: 'User kann nicht gekickt werden', ephemeral: true });
        }

        const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle(`${targetUser.tag} wurde gekickt`)
        .setDescription(`Von: ${interaction.user}\nGrund: ${reason}`)
        .setThumbnail('attachment://warning.png')
        .setTimestamp();

        await memberToKick.kick(reason);
        await interaction.reply({ content: `${targetUser.tag} wurde gekickt.`, ephemeral: true });
        await channel.send({ embeds: [embed], files: [warningFile] });

    }
}