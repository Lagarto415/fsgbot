const { EmbedBuilder } = require("discord.js");
const loadSettings = require("../functions/loadSettings");
const updateDriver = require("../backend/uploadToDB");


module.exports = {
    name: 'guildMemberRemove',
    async execute (member, client) {
        const updateNumbermessage = require("../functions/updateNumbermessage")(client);
        console.log(`Member ${member.user.username} left the Server!`);
        
        try {
            let parts = member.displayName.split("|");
            let number = parts[0];
            console.log(`Number extracted: ${number}`); // Debugging line to check the extracted number

            // Ensure updateDriver is awaited so errors within it are properly caught
            await updateDriver(number, null, null, null);
            await updateNumbermessage(member.guild.id);
        } catch (err) {
            console.error("Error processing member departure:", err);
        }

        const guildSettings = loadSettings(member.guild.id);
        const leaveChannelId = guildSettings.channels.goodbye;

        const channel = await member.guild.channels.fetch(leaveChannelId).catch(console.error);

        if (!channel) {
            console.log("Leave channel not found.");
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle('Bye bye')
            .setDescription(`Auf Wiedersehen <@${member.user.id}>! Schön, dass du da warst!`)
            .setThumbnail(member.user.displayAvatarURL());

        channel.send({ embeds: [embed] });
    }
}
