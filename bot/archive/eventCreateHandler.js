const { EmbedBuilder } = require("@discordjs/builders");
const loadTracks = require("../src/functions/loadTracks");
const { StringSelectMenuOptionBuilder, StringSelectMenuBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, MessageComponentInteraction, ButtonStyle, Message } = require("discord.js");
const tracksJSON = require("../src/data/tracks.json");

let event_type;
let track;

module.exports = {
    name: 'interactionCreate',

    async execute(interaction, client) {
        if (!interaction.isStringSelectMenu() && !interaction.isModalSubmit() && !interaction.isButton()) return

        if (interaction.customId === 'event-type'){
            event_type = interaction.values[0];
            const tracks = loadTracks()

            const trackOptions = Object.keys(tracks).map(trackName => {
                return {
                    label: trackName,
                    description: trackName,
                    value: trackName
                };
            });
            
            const options = trackOptions.map(option =>
                new StringSelectMenuOptionBuilder()
                    .setLabel(option.label)
                    .setDescription(option.description)
                    .setValue(option.value)
            );
    
            const trackSelector = new StringSelectMenuBuilder()
            .setCustomId('track-selector')
            .setPlaceholder('Strecke auswählen')
            .addOptions(options)

            await interaction.reply({ components: [new ActionRowBuilder().addComponents(trackSelector)], ephemeral: true });

        }
        else if (interaction.customId === 'track-selector'){
            track = interaction.values[0];

            const eventDescription = new TextInputBuilder()
            .setCustomId('event-description')
            .setLabel('Beschreibung')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)

            const eventDate = new TextInputBuilder()
            .setCustomId('event-date')
            .setLabel('Datum (DD/MM/YYYY)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

            const eventTime = new TextInputBuilder()
            .setCustomId('event-time')
            .setLabel('Zeit (HH:MM)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

            const modal = new ModalBuilder()
            .setTitle('Event erstellen')
            .setCustomId('event-modal')
            .addComponents(
                new ActionRowBuilder().addComponents(eventDescription),
                new ActionRowBuilder().addComponents(eventDate),
                new ActionRowBuilder().addComponents(eventTime)
            )

            await interaction.showModal(modal);
        }
        else if(interaction.customId === 'event-modal'){
            const description = interaction.fields.getTextInputValue('event-description');
            const date = interaction.fields.getTextInputValue('event-date');
            const time = interaction.fields.getTextInputValue('event-time');

            const [day, month, year] = date.split('/');
            const [hours, minutes] = time.split(':');

            const eventDateTime = new Date(year, month - 1, day, hours, minutes); // Month is zero-indexed
            const eventEndTime = new Date(eventDateTime); // Create a copy
            eventEndTime.setHours(eventEndTime.getHours() + 2); // Add 2 hours
            const eventEndTimestamp = Math.floor(eventEndTime.getTime() / 1000); 
            const eventTimestamp = Math.floor(eventDateTime.getTime() / 1000);

            const trackImg = tracksJSON[track].trackImage
            const trackEmj = tracksJSON[track].emoji

            let embed = new EmbedBuilder()
                .setTitle(`${trackEmj} Testrennen in ${track} ${trackEmj}`)
                .setDescription(description)
                .setColor(0xfcba03)
                .setTimestamp()
                .setImage(trackImg)
                .addFields(
                    { name: 'Zeit', value: `<t:${eventTimestamp.toString()}> - <t:${eventEndTimestamp.toString()}> \n :watch: <t:${eventTimestamp.toString()}:R>` }
                )
                .addFields(
                    { name: ':white_check_mark: Angemeldet', value: `\u200b`, inline: true, },
                    { name: ':x: Abgemeldet', value: `\u200b`, inline: true},
                    { name: ':grey_question: Noch unklar', value: `\u200b`, inline: true}
                )

            const row = new ActionRowBuilder()
                .setComponents(
                    new ButtonBuilder()
                    .setStyle('Success')
                    .setCustomId('event-accept')
                    .setEmoji('✅'),
                    new ButtonBuilder()
                    .setStyle('Danger')
                    .setCustomId('event-deny')
                    .setEmoji('✖️'),
                    new ButtonBuilder()
                    .setStyle('Secondary')
                    .setCustomId('event-tentitive')
                    .setEmoji('❓')
                )

            if (event_type === 'rennen'){
                embed.setTitle(`${trackEmj} Großer Preis von ${track} ${trackEmj}`)
            }

            await interaction.channel.send({ embeds: [embed], components: [row] });
            await interaction.reply({ content: 'Event erstellt', ephemeral: true });

        }
        else if (interaction.customId === 'event-accept' || interaction.customId === 'event-deny' || interaction.customId === 'event-tentitive') {
            const user = interaction.user;
            const userId = `<@${user.id}>`;
            const message = interaction.message;
            const embed = message.embeds[0];
        
            // Find all three fields for acceptance, denial, and uncertainty
            const acceptedField = embed.fields.find(field => field.name === ':white_check_mark: Angemeldet');
            const deniedField = embed.fields.find(field => field.name === ':x: Abgemeldet');
            const uncertainField = embed.fields.find(field => field.name === ':grey_question: Noch unklar');
        
            // Check if the user is already in any of the columns
            const isInAccepted = acceptedField && acceptedField.value.includes(userId);
            const isInDenied = deniedField && deniedField.value.includes(userId);
            const isInUncertain = uncertainField && uncertainField.value.includes(userId);
        
            // Remove user from the current column if the button corresponding to that column is pressed
            if (interaction.customId === 'event-accept' && isInAccepted) {
                acceptedField.value = acceptedField.value.replace(userId, '');
                acceptedField.value = acceptedField.value.trim().replace(/\n{2,}/g, '\n');
            } else if (interaction.customId === 'event-deny' && isInDenied) {
                deniedField.value = deniedField.value.replace(userId, '');
                deniedField.value = deniedField.value.trim().replace(/\n{2,}/g, '\n');
            } else if (interaction.customId === 'event-tentitive' && isInUncertain) {
                uncertainField.value = uncertainField.value.replace(userId, '');
                uncertainField.value = uncertainField.value.trim().replace(/\n{2,}/g, '\n');
            }
        
            // Add user to the target column if the button corresponding to that column is pressed
            if (!isInAccepted && interaction.customId === 'event-accept') {
                if (acceptedField) {
                    if (acceptedField.value === '\u200b') {
                        acceptedField.value = userId;
                    } else {
                        acceptedField.value += `\n${userId}`;
                    }
                }
                // Remove user from other columns if they are present
                if (deniedField) {
                    deniedField.value = deniedField.value.replace(userId, '');
                    deniedField.value = deniedField.value.trim().replace(/\n{2,}/g, '\n');
                }
                if (uncertainField) {
                    uncertainField.value = uncertainField.value.replace(userId, '');
                    uncertainField.value = uncertainField.value.trim().replace(/\n{2,}/g, '\n');
                }
            } else if (!isInDenied && interaction.customId === 'event-deny') {
                if (deniedField) {
                    if (deniedField.value === '\u200b') {
                        deniedField.value = userId;
                    } else {
                        deniedField.value += `\n${userId}`;
                    }
                }
                // Remove user from other columns if they are present
                if (acceptedField) {
                    acceptedField.value = acceptedField.value.replace(userId, '');
                    acceptedField.value = acceptedField.value.trim().replace(/\n{2,}/g, '\n');
                }
                if (uncertainField) {
                    uncertainField.value = uncertainField.value.replace(userId, '');
                    uncertainField.value = uncertainField.value.trim().replace(/\n{2,}/g, '\n');
                }
            } else if (!isInUncertain && interaction.customId === 'event-tentitive') {
                if (uncertainField) {
                    if (uncertainField.value === '\u200b') {
                        uncertainField.value = userId;
                    } else {
                        uncertainField.value += `\n${userId}`;
                    }
                }
                // Remove user from other columns if they are present
                if (acceptedField) {
                    acceptedField.value = acceptedField.value.replace(userId, '');
                    acceptedField.value = acceptedField.value.trim().replace(/\n{2,}/g, '\n');
                }
                if (deniedField) {
                    deniedField.value = deniedField.value.replace(userId, '');
                    deniedField.value = deniedField.value.trim().replace(/\n{2,}/g, '\n');
                }
            }
        
            // Edit the embed to reflect the changes
            await message.edit({ embeds: [embed] });
        
            // Acknowledge the interaction without sending any visible response
            await interaction.deferUpdate();
        }
        
    }
}
