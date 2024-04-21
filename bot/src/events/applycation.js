const {ActionRowBuilder, TextInputStyle, ModalBuilder, TextInputBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder} = require("discord.js");
const loadSettings = require("../functions/loadSettings");
const fs = require('fs');

const selections = {};

module.exports = {
    name: "interactionCreate",
    async execute(interaction) {
        
        if (!interaction.isButton() && !interaction.isModalSubmit() && !interaction.isStringSelectMenu()) return;

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
                            .setPlaceholder('KI Stärke eingeben')
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('fahrernummer')
                            .setLabel('Gewünschte Fahrernummer')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('eaId')
                            .setLabel('PSN / EA-Name')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    )
                );
            await interaction.showModal(modal);
        }
        else if (interaction.customId === 'application-modal' && interaction.isModalSubmit()) {
            // Processing modal submission
            const ki = interaction.fields.getTextInputValue('KI');
            const fahrernummer = interaction.fields.getTextInputValue('fahrernummer');
            const eaId = interaction.fields.getTextInputValue('eaId');

            // Now present select menus
            await interaction.reply({
                content: "Please choose your input device and team preference.",
                components: [
                    new ActionRowBuilder().addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('input-device')
                            .setPlaceholder('Choose input device')
                            .addOptions(
                                { label: 'Steering Wheel', value: 'wheel' },
                                { label: 'Controller', value: 'controller' }
                            )
                    ),
                    new ActionRowBuilder().addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('team-preference')
                            .setPlaceholder('Choose your preferred team')
                            .addOptions(
                                { label: 'Mercedes', value: 'mercedes' },
                                { label: 'Ferrari', value: 'ferrari' }
                                // Add more teams as required
                            )
                    )
                ],
                ephemeral: true
            });

        }
        else if (interaction.isSelectMenu()) {
            try {
                await interaction.deferUpdate(); // Acknowledge the interaction

                // Process the selection
                const selectedValue = interaction.values[0];
                console.log(`${interaction.user.tag} selected ${selectedValue}`);

                // Update the message or send a follow-up message
                await interaction.editReply({
                    content: `You have selected: ${selectedValue}`
                });

            } catch (error) {
                console.error('Error handling select menu interaction:', error);
                // Respond with an error message to the user, if necessary
                await interaction.followUp({
                    content: 'There was an error processing your selection.',
                    ephemeral: true
                });
            }
        }
    }
}