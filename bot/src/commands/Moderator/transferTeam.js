const { SlashCommandBuilder } = require("discord.js");
const updateDriver = require("../../backend/uploadToDB");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('transfer-team')
        .setDescription('Teamwechsel')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User')
                .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName('role1')
                .setDescription('Aktuelles Team')
                .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName('role2')
                .setDescription('Neues Team')
                .setRequired(true)
        ),

    async execute(interaction) {
        const targetUserId = interaction.options.getUser('user').id;
        const sourceRole = interaction.options.getRole('role1');
        const targetRole = interaction.options.getRole('role2');
        const member = await interaction.guild.members.fetch(targetUserId).catch(console.error);
        let parts = member.displayName.split("|");
        let number = parts[0];

        if (!member) {
            await interaction.reply({ content: 'Benutzer nicht gefunden.', ephemeral: true });
            return;
        }

        try {
            await member.roles.remove(sourceRole);
        } catch (err) {
            console.log("Error removing role: " + err);
            await interaction.reply({ content: `Fehler beim Entfernen des alten Teams: ${sourceRole.name}`, ephemeral: true });
            return;
        }

        try {
            await member.roles.add(targetRole);
        } catch (err) {
            console.log("Error adding role: " + err);
            await interaction.reply({ content: `Fehler beim Hinzufügen zum neuen Team: ${targetRole.name}`, ephemeral: true });
            return;
        }

        updateDriver(number, parts[1], targetRole.name,targetUserId);

        await member.setNickname(`${number}|${member.user.displayName}|${targetRole.name}`);

        await interaction.reply({
            content: `${member.user.displayName} hat das Team gewechselt. (${sourceRole.name} => ${targetRole.name})`,
            ephemeral: false
        });
    }
};
