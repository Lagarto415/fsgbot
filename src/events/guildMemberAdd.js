const { EmbedBuilder } = require("discord.js");
const getGuild = require("../modules/getGuild");

module.exports = {
    name: 'guildMemberAdd',
    async execute (member) {
        console.log("New member joined!");

        console.log(member)

        const guildId = member.guild.id

        const guildSettings = await getGuild(guildId);
        const welcomeChannelId = guildSettings.welcome;

        const BewerberRole = member.guild.roles.cache.find(role => role.id == guildSettings.modRoles[2].discordId);

        const channel = await member.guild.channels.fetch(welcomeChannelId).catch(console.error);
        const rulesChannel = await member.guild.channels.fetch(guildSettings.rules);

        if (!channel) {
            console.log("Welcome channel not found.");
            return;
        }

        const embed = new EmbedBuilder()
        .setTitle(`Willkommen in der FSG, ${member.user.displayName}`)
        .setDescription(`Hallo ${member.user}, bitte schaue dir die ${rulesChannel} an und bewirb dich als Fahrer.`)
        .setThumbnail(member.user.displayAvatarURL())
        .setTimestamp()


        member.roles.add(BewerberRole)

        if (channel) await channel.send({ embeds: [embed], content: `${member.user}` });
    }
}