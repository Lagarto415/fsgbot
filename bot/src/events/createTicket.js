const { ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, UserSelectMenuBuilder} = require("discord.js");
const loadSettings = require("../functions/loadSettings");
const fs = require('fs');

let ticketCount = 0;
let TicketOpenEmbed;
let newChannel;

module.exports = {
    name: "interactionCreate",

    async execute(interaction, client) {
        if (!interaction.isButton() && !interaction.isStringSelectMenu() && !interaction.isUserSelectMenu()) return; 
        else if (interaction.customId.startsWith("close-ticket")) {
            const [_, channelId] = interaction.customId.split('|');
            const channel = await interaction.guild.channels.fetch(channelId);
            if (channel) {
                interaction.user.send(`Ticket (${channel.name}) geschlossen`);
                channel.delete();
            }
        }
        else if(interaction.customId.startsWith("ticket-init")){
            const reasonSelection = new StringSelectMenuBuilder()
            .setCustomId('reason-selection')
            .setPlaceholder('Grund')
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
    
            const reasonEmbed = new EmbedBuilder()
            .setColor(0x00ffff)
            .setTitle('Grund')
            .setDescription('Warum möchtest du das Ticket erstellen?')
    
            const reasonRow = new ActionRowBuilder()
            .addComponents(reasonSelection)
    
            await interaction.reply({ embeds: [reasonEmbed], components: [reasonRow], ephemeral: true })

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
                default:
                    console.log("No valid reason selected");
            }  

            async function handleRennvorfall(){
                console.log("Rennvorfall selected");
                const selectionMenu = new UserSelectMenuBuilder()
                .setCustomId('rennvorfall')
                .setPlaceholder('Beschuldigter')
                .setMinValues(1)
                .setMaxValues(1)

                const selectionRow = new ActionRowBuilder()
                .addComponents(selectionMenu)

                const selectionEmbed = new EmbedBuilder()
                .setColor(0x00ffff)
                .setTitle('Ticket Konfigurieren')
                .setDescription('Welchen Beschuldigten?')


                await interaction.reply({ embeds: [selectionEmbed], components: [selectionRow], ephemeral: true })
            }
            async function handleAdminkontakt(){
                console.log("Adminkontakt selected");
                TicketOpenEmbed = new EmbedBuilder()
                .setTitle(`Adminkontakt`)
                .addFields({ name: 'Von:', value: interaction.user.toString()})

                newTicket('adminkontakt',interaction.user.id, 'Adminkontakt', interaction)
            }
            async function handleBugReport(){
                console.log("Bug Report selected");
                TicketOpenEmbed = new EmbedBuilder()
                .setTitle(`Bug Report`)
                .addFields({ name: 'Von:', value: interaction.user.toString()})

                newTicket('bug-report',interaction.user.id, 'Adminkontakt', interaction)
            }
            async function handleDnf(){
                console.log("Dnf selected");
                TicketOpenEmbed = new EmbedBuilder()
                .setTitle('DNF')
                .addFields({ name: 'Von:', value: interaction.user.toString()})

                newTicket('dnf',interaction.user.id, 'Rennvorfall', interaction)
            }
        }
        else if(interaction.isUserSelectMenu()){
            if (interaction.customId == 'rennvorfall'){
                TicketOpenEmbed = new EmbedBuilder()
                .setTitle(`Rennvorfall`)
                .addFields({ name: 'Rennvorfall gemeldet von:' ,value: interaction.user.toString()})
                .addFields({ name: 'Beschuldigter:', value: client.users.cache.find(user => user.id === interaction.values[0]).toString() })

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
        interaction.reply({
            content: `Ticket erstellt!`,
            ephemeral: true
        })
        await fs.promises.writeFile('./src/data/ticket_counter.json', JSON.stringify({ count: ticketCount }));

    } catch (err) { 
        console.error(err);
    }
    const closeTicket = new ButtonBuilder()
    .setCustomId(`close-ticket|${newChannel.id}`)
    .setLabel('Ticket schließen')
    .setStyle(ButtonStyle.Danger)

    const row = new ActionRowBuilder()
        .addComponents(closeTicket)

    const embed = TicketOpenEmbed;

    newChannel.send({ embeds: [embed], content: `<@&${notRole}>`, components: [row] }); 
}