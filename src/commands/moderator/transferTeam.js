const { SlashCommandBuilder } = require("discord.js");
const updateDriver = require("../../modules/updateDriver");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('teamwechsel')
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

    async execute(interaction, client) {

        await interaction.deferReply({ ephemeral: true });

        const updateNumbermessage = require("../../modules/updateNumbermessage");
        const targetUserId = interaction.options.getUser('user').id;
        const sourceRole = interaction.options.getRole('role1');
        const targetRole = interaction.options.getRole('role2');
        const member = await interaction.guild.members.fetch(targetUserId).catch(console.error);
        let parts = member.displayName.split("|");
        let number = parts[0];

        if (!member) {
            await interaction.editReply({ content: 'Benutzer nicht gefunden.', ephemeral: true });
            return;
        }

        if (sourceRole.name === targetRole.name) {
            await interaction.editReply({ content: 'Der Fahrer ist bereits in diesem Team.', ephemeral: true });
            return;
        }

        if(!member.roles.cache.has(sourceRole.id)) {
            await interaction.editReply({ content: 'Der Fahrer ist nicht in diesem Team.', ephemeral: true });
            return;
        }

        try {
            await member.roles.remove(sourceRole);
        } catch (err) {
            console.log("Error removing role: " + err);
            await interaction.editReply({ content: `Fehler beim Entfernen des alten Teams: ${sourceRole.name}`, ephemeral: true });
            return;
        }

        try {
            await member.roles.add(targetRole);
        } catch (err) {
            console.log("Error adding role: " + err);
            await interaction.editReply({ content: `Fehler beim Hinzufügen zum neuen Team: ${targetRole.name}`, ephemeral: true });
            return;
        }

        await updateDriver({number: number, name:  parts[1], team: targetRole.name, discordId: targetUserId});


        try{
            await member.setNickname(`${number}|${member.user.displayName}|${targetRole.name}`);
        }
        catch(err){
            console.log("Error setting nickname: " + err);
            await interaction.editReply({ content: `Fehler beim Setzen des Nicknames: ${number}|${member.user.displayName}|${targetRole.name}`, ephemeral: true });
            return;
        }

        await updateNumbermessage(client, interaction.guildId);

        await interaction.editReply({
            content: `${member.user.displayName} hat das Team gewechselt. (${sourceRole.name} => ${targetRole.name})`,
            ephemeral: false
        });
    }
};
