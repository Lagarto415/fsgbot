const { EmbedBuilder } = require("discord.js");
const updateNumbermessage = require("../modules/updateNumbermessage");
const updateDriver = require("../modules/updateDriver");
const getGuild = require("../modules/getGuild");
module.exports = {
    name: 'guildMemberRemove',
    async execute (member, client) {
        console.log(`Member ${member.user.username} left the Server!`);
        
        try {
            let parts = member.displayName.split("|");
            let number = parts[0];
            console.log(`Number extracted: ${number}`); // Debugging line to check the extracted number

            // Ensure updateDriver is awaited so errors within it are properly caught
            await updateDriver({number: number, name: null, discordId: null, teamId: null});
            updateDriver
            updateNumbermessage;
        } catch (err) {
            console.error("Error processing member departure:", err);
        }

        const guildSettings = await getGuild(member.guild.id);
        const leaveChannelId = guildSettings.leave;

        const channel = await member.guild.channels.fetch(leaveChannelId).catch(console.error);

        if (!channel) {
            console.log("Leave channel not found.");
            return;
        }
        await updateNumbermessage(client, member.guild.id);

        const embed = new EmbedBuilder()
            .setTitle('Bye bye')
            .setDescription(`Auf Wiedersehen <@${member.user.id}>! Schön, dass du da warst!`)
            .setThumbnail(member.user.displayAvatarURL());

        channel.send({ embeds: [embed] });
    }
}
