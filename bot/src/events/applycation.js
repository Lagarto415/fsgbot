const {ActionRowBuilder,AttachmentBuilder, TextInputStyle, ModalBuilder, TextInputBuilder, ButtonBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder} = require("discord.js");
const loadSettings = require("../functions/loadSettings");
const fetchDataFromBackend = require("../functions/dataClient");
const updateDriver = require("../backend/uploadToDB");


let ki = '';
let fahrernummer = '';
let eaId = '';
let inputDevice = '';
let TeamRole;
let f1Role;

const applicationState = {};

module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {
        const updateNumbermessage = require("../functions/updateNumbermessage")(client);
        const f1Role = interaction.guild.roles.cache.get(loadSettings(interaction.guild.id).roles.F1Driver);

        if (!interaction.isButton() && !interaction.isModalSubmit() && !interaction.isStringSelectMenu()) return;

        // Initiate the application process
        if (interaction.customId === "application") {
            const allTeams = ["RedBull", "Ferrari", "McLaren", "Mercedes", "Aston Martin", "Alpha Tauri", "Haas", "Williams", "Alpine", "Alfa Romeo", "Ersatzfahrer"];
            const teamSelector = new StringSelectMenuBuilder()
                .setCustomId('application-selector')
                .setPlaceholder('Wunschteam auswählen')
                .addOptions(allTeams.map(team => ({ label: team, value: team })));

            const row = new ActionRowBuilder().addComponents(teamSelector);
            await interaction.reply({ components: [row], ephemeral: true });
        }

        // Handle team selection and show modal for additional data
        else if (interaction.customId === "application-selector") {
            if (interaction.isStringSelectMenu() && interaction.values && interaction.values.length > 0) {
                const teamPreference = interaction.values[0];

                // Store team preference in application state
                applicationState[interaction.user.id] = { teamPreference };

                const modal = new ModalBuilder()
                    .setCustomId('application-modal')
                    .setTitle('FSG Fahrerbewerbung')
                    .addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder().setCustomId('KI').setLabel('KI Stärke').setStyle(TextInputStyle.Short).setPlaceholder('Deine ungefähre KI Stärke').setRequired(true)
                        ),
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder().setCustomId('fahrernummer').setLabel('Gewünschte Fahrernummer').setStyle(TextInputStyle.Short).setPlaceholder('Welche Fahrernummer hättest du gerne?').setRequired(true)
                        ),
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder().setCustomId('eaId').setLabel('PSN / EA-Name').setStyle(TextInputStyle.Short).setPlaceholder('PSN / EA-Name').setRequired(true)
                        ),
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder().setCustomId('input-device').setLabel('Lenkrad / Controller').setStyle(TextInputStyle.Short).setPlaceholder('Lenkrad / Controller').setRequired(true)
                        )
                    );
                await interaction.showModal(modal);
            }
        }

        // Handle modal submission
        else if (interaction.customId === 'application-modal' && interaction.isModalSubmit()) {
            try {
                const userId = interaction.user.id;
                const ki = parseInt(interaction.fields.getTextInputValue('KI'), 10);
                const fahrernummer = parseInt(interaction.fields.getTextInputValue('fahrernummer'), 10);
                const eaId = interaction.fields.getTextInputValue('eaId');
                const inputDevice = interaction.fields.getTextInputValue('input-device');

                // Validate numeric values
                if (isNaN(ki) || isNaN(fahrernummer) || ki <= 0 || ki > 110) {
                    return interaction.reply({ content: `Deine Angaben sind ungültig.`, ephemeral: true });
                }

                // Retrieve team preference and update application state
                const { teamPreference } = applicationState[userId] || {};
                if (!teamPreference) {
                    return interaction.reply({ content: `Fehler: Teamwunsch nicht gefunden. Bitte erneut auswählen.`, ephemeral: true });
                }
                if (await checkIfTeamIsFree(teamPreference) == false) {
                    return interaction.reply({ content: `Fehler: Das angegebene Team ist nicht frei. Bitte erneut auswählen.`, ephemeral: true });
                }

                // Update state with all other data
                applicationState[userId] = {
                    teamPreference,
                    ki,
                    fahrernummer,
                    eaId,
                    inputDevice
                };

                const embed = new EmbedBuilder()
                    .setTitle(`Fahrerbewerbung von ${interaction.user.displayName}`)
                    .setDescription(`<@${interaction.user.id}>`)
                    .addFields(
                        { name: 'Teamwunsch', value: teamPreference },
                        { name: 'PSN / EA-Name', value: eaId },
                        { name: 'Fahrernummer', value: fahrernummer.toString(), inline: true },
                        { name: 'KI-Stärke', value: ki.toString(), inline: true },
                        { name: 'Lenkrad / Controller', value: inputDevice, inline: true }
                    )
                    .setColor(0xae00ff)
                    .setTimestamp()
                    .setThumbnail('attachment://formular.png');

                const AdminRole = interaction.guild.roles.cache.get(loadSettings(interaction.guildId).roles.admin);
                const file = new AttachmentBuilder('./src/images/formular.png');
                const buttonRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setStyle('Success').setCustomId('application-accepted').setLabel('Annehmen').setEmoji('✅'),
                    new ButtonBuilder().setStyle('Danger').setCustomId('application-rejected').setLabel('Ablehnen').setEmoji('✖️')
                );

                const newAppChannel = client.channels.cache.get(loadSettings(interaction.guild.id).channels.newApplications);
                await newAppChannel.send({ embeds: [embed], files: [file], components: [buttonRow], content: `${AdminRole}` });
                await interaction.reply({ content: `Deine Bewerbung wurde abgeschickt.`, ephemeral: true });
            } catch (error) {
                console.error('Error processing application modal:', error);
                await interaction.reply({ content: 'Fehler bei der Verarbeitung der Bewerbung.', ephemeral: true });
            }
        }

        // Handle application acceptance
        else if (interaction.customId === 'application-accepted') {
            try {
                await interaction.deferUpdate();
                // Retrieve user ID from the embed description
                const userId = interaction.message.embeds[0]?.description.match(/<@(\d+)>/)[1];
                const applicationData = applicationState[userId] || {};

                // If data is missing, send a fallback error
                if (!applicationData.fahrernummer || !applicationData.teamPreference) {
                    return interaction.reply({ content: 'Fehler bei der Annahme der Bewerbung: Daten nicht gefunden.', ephemeral: true });
                }

                // Fetch user data from Discord
                let member = await interaction.guild.members.fetch(userId);
                const settings = loadSettings(interaction.guildId);
                const role = interaction.guild.roles.cache.get(settings.roles[applicationData.teamPreference]);

                // Update driver information
                await updateDriver(applicationData.fahrernummer, member.displayName, applicationData.teamPreference, member.id);
                await updateNumbermessage(interaction.guildId);

                // Add roles only if the user doesn't have them
                if (!member.roles.cache.has(role.id)) {
                    await member.roles.add(role);
                }
                if (!member.roles.cache.has(f1Role.id)) {
                    await member.roles.add(f1Role);
                }

                // Update the member's nickname
                await member.setNickname(`${applicationData.fahrernummer}|${member.displayName}|${applicationData.teamPreference}`);

                // Delete the interaction message
                await interaction.message.delete();

                // Send a direct message to the applying user
                await member.send('Wir freuen uns dich in der FSG Willkommen zu heißen. Deine Bewerbung wurde angenommen.');

                // Confirm the acceptance
                await interaction.followUp({ content: `Die Bewerbung von <@${userId}> wurde angenommen.`, ephemeral: true });
            } catch (error) {
                console.error('Error processing application acceptance:', error);
                await interaction.followUp({ content: 'Fehler bei der Annahme der Bewerbung.', ephemeral: true });
            }
        }

        // Handle application rejection
        else if (interaction.customId === 'application-rejected') {
            try {
                const userId = interaction.message.embeds[0]?.description.match(/<@(\d+)>/)[1];
                await interaction.guild.members.fetch(userId).then(member => member.send('Leider wurde deine Bewerbung abgelehnt. Versuche es später noch einmal.'));
                await interaction.message.delete();
                await interaction.reply({ content: `Die Bewerbung von <@${userId}> wurde abgelehnt.`, ephemeral: true });
            } catch (error) {
                console.error('Error processing application rejection:', error);
                await interaction.reply({ content: 'Fehler bei der Ablehnung der Bewerbung.', ephemeral: true });
            }
        }
    }
}

async function checkIfTeamIsFree(teamName) {
    const fetch = (await import('node-fetch')).default;
    const backendUrl = `http://localhost:3000/team-count/${encodeURIComponent(teamName)}`;

    console.log("Checking if team is free:", teamName);

    try {
        const response = await fetch(backendUrl);
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Backend error: ${response.status} - ${response.statusText}: ${errorText}`);
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const isFree = await response.json();
        console.log("Team is free:", isFree);
        return isFree;
    } catch (error) {
        console.error('Failed to check if team is free:', error);
        return false; // Assume not free if there's an error
    }
}