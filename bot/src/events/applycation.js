const {ActionRowBuilder,AttachmentBuilder, TextInputStyle,ButtonStyle, ModalBuilder, TextInputBuilder, ButtonBuilder, EmbedBuilder} = require("discord.js");
const loadSettings = require("../functions/loadSettings");
const fs = require('fs');


let applyingUser = ''
let ki = '';
let fahrernummer = '';
let eaId = '';
let inputDevice = '';
let teamPreference = '';

module.exports = {
    name: "interactionCreate",
    async execute(interaction) {
        
        if (!interaction.isButton() && !interaction.isModalSubmit()) return;

        if (interaction.customId == "application") {
            // Code for showing initial modal
            const modal = new ModalBuilder()
                .setCustomId('application-modal')
                .setTitle('FSG Fahrerbewerbung')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('KI')
                            .setLabel('KI Stärke')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('Deine ungefähre KI Stärke')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('fahrernummer')
                            .setLabel('Gewünschte Fahrernummer')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('Welche Fahrernummer hättest du gerne?')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('eaId')
                            .setLabel('PSN / EA-Name')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('PSN / EA-Name')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('input-device')
                            .setLabel('Lenkrad / Controller')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('Lenkrad / Controller')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('team-preference')
                            .setLabel('Teamwunsch')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('Für welches Team willst du fahren?')
                            .setRequired(true)
                    )
                );
            await interaction.showModal(modal);
        }
        else if (interaction.customId === 'application-modal' && interaction.isModalSubmit()) {
            // Processing modal submission
            ki = interaction.fields.getTextInputValue('KI');
            fahrernummer = interaction.fields.getTextInputValue('fahrernummer');
            eaId = interaction.fields.getTextInputValue('eaId');
            inputDevice = interaction.fields.getTextInputValue('input-device');
            teamPreference = interaction.fields.getTextInputValue('team-preference');
            const file = new AttachmentBuilder('./src/images/formular.png');

            applyingUser = interaction.user;

            const userImage = interaction.user.displayAvatarURL({ format: 'png', dynamic: true, size: 512 });

            const buttonRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle('Success')
                        .setCustomId('application-accepted')
                        .setLabel('Annehmen')
                        .setEmoji('✅'),
                    new ButtonBuilder()
                        .setStyle('Danger')
                        .setLabel('Ablehnen')
                        .setCustomId('application-rejected')
                        .setEmoji('✖️')
                )

            const embed = new EmbedBuilder()
                .setTitle(`Fahrerbewerbung von ${interaction.user.displayName}`)
                .setDescription(`<@${interaction.user.id}>`)
                .addFields(
                    { name: 'Teamwunsch', value: teamPreference },
                    { name: 'PSN / EA-Name', value: eaId },
                    { name: 'Fahrernummer', value: fahrernummer, inline: true },
                    { name: 'KI-Stärke', value: ki, inline: true },
                    { name: 'Lenkrad / Controller', value: inputDevice, inline: true }
                )
                .setColor(0xae00ff)
                .setTimestamp()
                .setThumbnail('attachment://formular.png')
                
            await interaction.reply({ embeds: [embed], files: [file], components: [buttonRow] });
        }
        else if (interaction.customId === 'application-accepted') {
            const member = await interaction.guild.members.fetch(applyingUser.id);

            await member.setNickname(`${fahrernummer}|${applyingUser.displayName}|${teamPreference}`);
            await interaction.reply({ content: 'Die Bewerbung von ' + applyingUser.displayName + ' wurde angenommen!'});
        }
        else if (interaction.customId === 'application-rejected') {
            await interaction.reply({ content: 'Die Bewerbung von ' + applyingUser.displayName + ' wurde abgelehnt!'});
        }
    }
}