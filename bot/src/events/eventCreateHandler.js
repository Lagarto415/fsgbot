const { EmbedBuilder } = require("@discordjs/builders");
const loadTracks = require("../functions/loadTracks");
const { StringSelectMenuOptionBuilder, StringSelectMenuBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, MessageComponentInteraction, ButtonStyle, Message } = require("discord.js");
const tracksJSON = require("../data/tracks.json");

let event_type;
let track;
let eventDateTime;

function updateUserListAndCount(field, userId, addingUser) {
    // Check if the field already has a count and remove it for updating
    let baseName = field.name.replace(/\s\(\d+\)$/, '');
    
    if (addingUser) {
        field.value = field.value === '\u200b' ? userId : `${field.value}\n${userId}`;
    } else {
        field.value = field.value.replace(userId, '').trim().replace(/\n{2,}/g, '\n') || '\u200b';
    }
    const count = field.value === '\u200b' ? 0 : field.value.split('\n').length;
    field.name = `${baseName} (${count})`;
}

function isWithinTimeLimit(eventDateTime) {
    const now = new Date();
    const timeLimit = new Date(eventDateTime.getTime() - 4 * 60 * 60 * 1000); // 4 hours before the event
    return now >= timeLimit;
}

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

            eventDateTime = new Date(year, month - 1, day, hours, minutes); // Month is zero-indexed
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
                    .setEmoji('✔️'),
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

            await interaction.channel.send({ embeds: [embed], components: [row], content: `@everyone` });
            await interaction.reply({ content: 'Event erstellt', ephemeral: true });

        }
        else if (interaction.customId === 'event-accept' || interaction.customId === 'event-deny' || interaction.customId === 'event-tentitive') {
        
            if (isWithinTimeLimit(eventDateTime)) {
                await interaction.reply({ content: 'Die Anmeldefrist ist abgelaufen', ephemeral: true });
                return;
            }
        
            const user = interaction.user;
            const userId = `<@${user.id}>`;
            const message = interaction.message;
            const embed = message.embeds[0];
            const action = interaction.customId.split('-')[1];
        
            const fields = {
                accept: embed.fields.find(field => field.name.startsWith(':white_check_mark:')),
                deny: embed.fields.find(field => field.name.startsWith(':x:')),
                tentitive: embed.fields.find(field => field.name.startsWith(':grey_question:'))
            };
        
            Object.keys(fields).forEach(key => {
                if (action === key && !fields[key].value.includes(userId)) {
                    updateUserListAndCount(fields[key], userId, true);
                } else if (fields[key].value.includes(userId)) {
                    updateUserListAndCount(fields[key], userId, false);
                }
            });
        
            await message.edit({ embeds: [embed] });
            await interaction.deferUpdate();
        }
        
    }
}
