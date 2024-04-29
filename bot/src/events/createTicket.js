const { ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, UserSelectMenuBuilder, AttachmentBuilder} = require("discord.js");
const loadSettings = require("../functions/loadSettings");
const fs = require('fs');

let ticketCount = 0;
let TicketOpenEmbed;
let newChannel;

module.exports = {
    name: "interactionCreate",

    async execute(interaction, client) {
        const settings = loadSettings(interaction.guildId);
        const fiaRole = settings.roles.fia;
        const adminRole = settings.roles.admin;
        const ModLog =  client.channels.cache.get(settings.channels.modlog);
        const warningFile = new AttachmentBuilder('./src/images/warning.png');
        
        if (!interaction.isButton() && !interaction.isStringSelectMenu() && !interaction.isUserSelectMenu()) return; 
        else if (interaction.customId.startsWith("close-ticket")) {
            const [_, channelId] = interaction.customId.split('|');
            const channel = await interaction.guild.channels.fetch(channelId);
            const member = await interaction.guild.members.fetch(interaction.user.id);
            if (!member.roles.cache.has(fiaRole) && !member.roles.cache.has(adminRole)){
                const embed = new EmbedBuilder()
                .setColor(0xff1100)
                .setTitle("Unerlaubter Versuch Ticket zu schließen")
                .setDescription(`${interaction.user} hat versucht das Ticket ${channel} zu schließen`)
                .setThumbnail('attachment://warning.png')
                .setTimestamp()
                interaction.reply({ content: "Du musst Teil FIA oder Admin sein um ein Ticket zu schließen", ephemeral: true });
                ModLog.send({ embeds: [embed], files: [warningFile] });
                return;
            }
            if (channel) {
                const embed = new EmbedBuilder()
                .setColor(0xff1100)
                .setTitle("Ticket geschlossen")
                .setDescription(`Ticket: ${channel.name}\nVon: ${interaction.user}`)
                .setThumbnail('attachment://warning.png')
                .setTimestamp()
                ModLog.send({embeds: [embed], files: [warningFile]});
                channel.delete();
            }
        }
        
        
        else if(interaction.customId.startsWith("ticket-init")){
            const member = await interaction.guild.members.fetch(interaction.user.id);
            const reasonSelection = new StringSelectMenuBuilder()
            .setCustomId('reason-selection')
            .setPlaceholder('Warum möchtest du das Ticket erstellen?')
            .addOptions([
                new StringSelectMenuOptionBuilder()
                .setLabel('Rennvorfall')
                .setDescription('Du möchtest einen Rennvorfall melden')
                .setValue('rennvorfall'),
                new StringSelectMenuOptionBuilder()
                .setLabel('DNF')
                .setDescription('Du möchtest dein DNF melden')
                .setValue('dnf'),
                new StringSelectMenuOptionBuilder()
                .setLabel('Adminkontakt')
                .setDescription('Du möchtest das Adminteam kontaktieren')
                .setValue('adminkontakt'),
                new StringSelectMenuOptionBuilder()
                .setLabel('Bug Report')
                .setDescription('Du möchtest einen Bug melden')
                .setValue('bug-report'),
            ])

            if (member.roles.cache.has(fiaRole) || member.roles.cache.has(adminRole)) {
                reasonSelection.addOptions([
                    new StringSelectMenuOptionBuilder()
                    .setLabel('Auswertung & An/Abmeldung')
                    .setDescription('Auswertung & An/Abmeldung')
                    .setValue('auswertung'),
                ])
            }

            const reasonRow = new ActionRowBuilder()
            .addComponents(reasonSelection)
    
            await interaction.reply({ components: [reasonRow], ephemeral: true })

        }
        else if (interaction.isStringSelectMenu()) {
            const selectedReason = interaction.values[0]

            switch (selectedReason) {
                case 'rennvorfall': 
                    handleRennvorfall();
                    break;
                case 'dnf':
                    handleDnf();
                    break;
                case 'adminkontakt':
                    handleAdminkontakt();
                    break;
                case 'bug-report':
                    handleBugReport();
                    break;
                case 'auswertung':
                    handleAuswertung();
                    handleAnAbmeldung();
                    break;
                default:
                    console.log("No valid reason selected");
            }  

            async function handleRennvorfall(){
                console.log("Rennvorfall selected");
                const selectionMenu = new UserSelectMenuBuilder()
                .setCustomId('rennvorfall')
                .setPlaceholder('Wer war an diesem Rennvorfall mit beteiligt?')
                .setMinValues(1)
                .setMaxValues(1)

                const selectionRow = new ActionRowBuilder()
                .addComponents(selectionMenu)

                await interaction.reply({components: [selectionRow], ephemeral: true })
            }
            async function handleAdminkontakt(){
                console.log("Adminkontakt selected");
                TicketOpenEmbed = new EmbedBuilder()
                .setTitle(`Adminkontakt`)
                .setColor(0xae00ff)
                .addFields({ name: 'Von:', value: interaction.user.toString()})
                .setTimestamp()

                newTicket('adminkontakt',interaction.user.id, 'Adminkontakt', interaction)
            }
            async function handleBugReport(){
                console.log("Bug Report selected");
                TicketOpenEmbed = new EmbedBuilder()
                .setTitle(`Bug Report`)
                .setColor(0xae00ff)
                .addFields({ name: 'Von:', value: interaction.user.toString()})
                .setTimestamp()

                newTicket('bug-report',interaction.user.id, 'Adminkontakt', interaction)
            }
            async function handleDnf(){
                console.log("Dnf selected");
                TicketOpenEmbed = new EmbedBuilder()
                .setTitle('DNF')
                .setColor(0xae00ff)
                .addFields({ name: 'Von:', value: interaction.user.toString()})
                .setTimestamp()

                newTicket('dnf',interaction.user.id, 'Rennvorfall', interaction)
            }
            async function handleAuswertung(){
                console.log("Auswertung selected");
                TicketOpenEmbed = new EmbedBuilder()
                .setTitle('Auswertung')
                .setColor(0xae00ff)
                .addFields({ name: 'Von:', value: interaction.user.toString()})
                .setTimestamp()

                newTicket('auswertung',interaction.user.id, 'Rennvorfall', interaction)
            }
            async function handleAnAbmeldung(){
                console.log("An und Abmeldung selected");
                TicketOpenEmbed = new EmbedBuilder()
                .setTitle('An und Abmeldung')
                .setColor(0xae00ff)
                .addFields({ name: 'Von:', value: interaction.user.toString()})
                .setTimestamp()

                newTicket('an-und-abmeldung',interaction.user.id, 'Rennvorfall', interaction)
            }
            
        }
        else if(interaction.isUserSelectMenu()){
            if (interaction.customId == 'rennvorfall'){
                TicketOpenEmbed = new EmbedBuilder()
                .setTitle(`Rennvorfall`)
                .setColor(0xae00ff)
                .addFields({ name: 'Rennvorfall gemeldet von:' ,value: interaction.user.toString()})
                .addFields({ name: 'Beschuldigter:', value: client.users.cache.find(user => user.id === interaction.values[0]).toString() })
                .setTimestamp()

                newTicket('rennvorfall',interaction.user.id, 'Rennvorfall', interaction)
            }
        }

    }
}

async function newTicket(reason, initiator, notificationRole, interaction) {
    console.log("New Ticket");
    const settings = loadSettings(interaction.guildId);
    let notRole;

    switch (notificationRole) {
        case "Adminkontakt":
            notRole = settings.roles.admin;
            break;
        case "Rennvorfall":
            notRole = settings.roles.fia;
            break;
        default:
            console.log("No notification role found");
    }

    try {
        const data = await fs.promises.readFile('./src/data/ticket_counter.json', 'utf8');
        const counterData = JSON.parse(data);
        let ticketCount = counterData.count; 

        ticketCount++;
        newChannel = await interaction.guild.channels.create({
            name: `${ticketCount} - ${interaction.user.displayName} - ${reason}`,
            type: ChannelType.GuildText,
            parent: settings.categories.ticketCategory,
            permissionOverwrites: [
                {
                    id: initiator,
                    allow: ["SendMessages", "ViewChannel", "ReadMessageHistory"],
                },
                {
                    id: notRole,
                    allow: ["SendMessages", "ViewChannel", "ReadMessageHistory"],
                },
                {
                    id: interaction.guild.roles.everyone,
                    deny: ["SendMessages", "ViewChannel", "ReadMessageHistory"]
                }
            ]
        })
        await interaction.deferUpdate();
        await fs.promises.writeFile('./src/data/ticket_counter.json', JSON.stringify({ count: ticketCount }));

    } catch (err) { 
        console.error(err);
    }
    const file = new AttachmentBuilder('./src/images/ticket.png');
    const closeTicket = new ButtonBuilder()
    .setCustomId(`close-ticket|${newChannel.id}`)
    .setLabel('Ticket schließen')
    .setStyle(ButtonStyle.Danger)

    const row = new ActionRowBuilder()
        .addComponents(closeTicket)

    const embed = TicketOpenEmbed;
    embed.setThumbnail('attachment://ticket.png');

    newChannel.send({ embeds: [embed], content: `<@&${notRole}>`, components: [row], files: [file] }); 
}