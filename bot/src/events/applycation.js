const {ActionRowBuilder,AttachmentBuilder, TextInputStyle, ModalBuilder, TextInputBuilder, ButtonBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder} = require("discord.js");
const loadSettings = require("../functions/loadSettings");
const fetchDataFromBackend = require("../functions/dataClient");
const updateDriver = require("../backend/uploadToDB");


let applyingUser = ''
let ki = '';
let fahrernummer = '';
let eaId = '';
let inputDevice = '';
let TeamRole;
let teamPreference = '';

module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {
        const nummerChannel = client.channels.cache.get(loadSettings(interaction.guild.id).channels.numberchannel);
        const updateNumbermessage = require("../functions/updateNumbermessage")(client);
        
        if (!interaction.isButton() && !interaction.isModalSubmit() && !interaction.isStringSelectMenu()) return;
        if (interaction.customId == "application") {
            const allTeams = ["RedBull", "Ferrari", "McLaren", "Mercedes", "Aston Martin", "Alpha Tauri", "Haas", "Williams", "Alpine", "Alfa Romeo", "Ersatzfahrer"]
            const sel1 = new StringSelectMenuBuilder()
                .setCustomId('application-selector')
                .setPlaceholder('Wunschteam auswählen')
                .addOptions(allTeams.map(team => ({
                    label: team,
                    value: team  // Using the exact string from the array
                })));
        
            const row = new ActionRowBuilder()
                .addComponents(sel1);
        
            await interaction.reply({ components: [row], ephemeral: true });
        }        

        else if (interaction.customId == "application-selector") {
            if (interaction.isStringSelectMenu() && interaction.values && interaction.values.length > 0) {
                teamPreference = interaction.values[0];
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
                    )
                );
            await interaction.showModal(modal);
        }
    }
        else if (interaction.customId === 'application-modal' && interaction.isModalSubmit()) {
            // Processing modal submission
            ki = parseInt(interaction.fields.getTextInputValue('KI'));
            fahrernummer = parseInt(interaction.fields.getTextInputValue('fahrernummer'));
            eaId = interaction.fields.getTextInputValue('eaId');
            inputDevice = interaction.fields.getTextInputValue('input-device');
            const file = new AttachmentBuilder('./src/images/formular.png');
            const alldata = (await fetchDataFromBackend()).data;
            const fahrerfeld = client.channels.cache.get(loadSettings(interaction.guildId).channels.fahrerfeld);
            const newAppChannel = client.channels.cache.get(loadSettings(interaction.guildId).channels.newApplications);
            applyingUser = interaction.user;

            console.log("Fahrernummer: "+ alldata[fahrernummer-1].driverNumber);
            console.log("Displayname: "+ alldata[fahrernummer-1].displayName);


            const driverData = alldata.find(driver => driver.driverNumber === fahrernummer);
            if (driverData && driverData.displayName) {
                if(driverData.discordId != 'X'){
                    return interaction.reply({
                        content: `Deine angegebene Fahrernummer (${fahrernummer}) ist nicht verfügbar, sie gehört <@${driverData.discordId}>. Bitte wähle eine freie Nummer. ${nummerChannel}`,
                        ephemeral: true
                    });
                }
                else{
                    return interaction.reply({content: `Deine angegebene Fahrernummer (${fahrernummer}) ist nicht verfügbar. Bitte wähle eine freie Nummer. ${nummerChannel}`, ephemeral: true})
                }
            }
            else if ( ki > 110 || ki <= 0) {
                return interaction.reply({content: `Deine angegebene KI-Stärke (${ki}) ist ungültig.`, ephemeral: true})
            }
            if (! await checkIfTeamIsFree(teamPreference)){
                return interaction.reply({content: `Dein angegebener Teamwunsch (${teamPreference}) ist nicht verfügbar.\nWenn im ${fahrerfeld} keine Plätze mehr frei sind, gib **Ersatzfahrer** als Team an.`, ephemeral: true})
            }

            ki = ki.toString();
            fahrernummer = fahrernummer.toString();

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

            const AdminRole = interaction.guild.roles.cache.get(loadSettings(interaction.guildId).roles.admin);
                
            await newAppChannel.send({ embeds: [embed], files: [file], components: [buttonRow], content: `${AdminRole}` });
            await interaction.reply({ content: `Deine Bewerbung wurde abgeschickt.`, ephemeral: true });
        }
        else if (interaction.customId === 'application-accepted') {
            let member;
            console.log(teamPreference)
            try{
                member = await interaction.guild.members.fetch(applyingUser.id);
            }
            catch(error){
                console.log("Failed to fetch member: "+error)
                return
            }
            const settings = loadSettings(interaction.guildId);
            const role = interaction.guild.roles.cache.get(settings.roles[teamPreference])

            await updateDriver(fahrernummer, applyingUser.displayName, teamPreference, member.id);
            await updateNumbermessage(interaction.guildId);

            await member.roles.add(role);
            await member.setNickname(`${fahrernummer}|${applyingUser.displayName}|${teamPreference}`);
            try{
                await interaction.message.delete()
            }
            catch(error){
                console.log("Failed to delete Message: "+error)
            }
            await applyingUser.send('Wir freuen uns dich in der FSG Willkommen zu heißen. Deine Bewerbung wurde angenommen. Vielen Spaß bei der FSG.')
            await interaction.reply({ content: `Die Bewerbung von <@${applyingUser.id}> wurde von <@${interaction.user.id}> angenommen.`});
        }
        else if (interaction.customId === 'application-rejected') {
            await applyingUser.send('Leider wurde deine Bewerbung abgelehnt. Versuche es später noch einmal.')
            try{
                await interaction.message.delete()
            }
            catch(error){
                console.log("Failed to delete Message: "+error)
            }
            await interaction.reply({ content: `Die Bewerbung von <@${applyingUser.id}> wurde von <@${interaction.user.id}> abgelehnt.`});
        }
    }
}

async function checkIfTeamIsFree(teamName) {
    const fetch = (await import('node-fetch')).default;
    const backendUrl = `http://localhost:3000/team-count/${encodeURIComponent(teamName)}`;

    try {
        const response = await fetch(backendUrl);
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const isFree = await response.json();
        return isFree; // Returns true if the team is free, false otherwise
    } catch (error) {
        console.error('Failed to check if team is free:', error);
        return false; // Assume not free if there's an error
    }
}
