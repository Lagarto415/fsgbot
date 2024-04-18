const { ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, UserSelectMenuBuilder, ModalBuilder  } = require("discord.js");
const loadSettings = require("../functions/loadSettings");
const fs = require('fs');

let ticketCount = 0;



let newChannel;

module.exports = {
    name: "interactionCreate",

    async execute(interaction, client) {
        if (!interaction.isButton()) return;
        if (interaction.customId.startsWith("new-ticket")) {
            let messageLog = [];
            let [_,grund] = interaction.customId.split('|');
            console.log("New Ticket");
            const settings = loadSettings(interaction.guildId);
            async function updateTicketCount() {
                try {
                    const data = await fs.promises.readFile('./src/data/ticket_counter.json', 'utf8');
                    const counterData = JSON.parse(data);
                    let ticketCount = counterData.count; 

                    ticketCount++;
                    newChannel = await interaction.guild.channels.create({
                        name: `${ticketCount} - ${interaction.user.displayName}`,
                        type: ChannelType.GuildText,
                        parent: settings.ticketCategory,
                        permissionOverwrites: [
                            {
                                id: interaction.user.id,
                                allow: ["SendMessages", "ViewChannel", "ReadMessageHistory"],
                            },
                            {
                                id: settings.admin,
                                allow: ["SendMessages", "ViewChannel", "ReadMessageHistory"],
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
            }

           await updateTicketCount(); // Call the function
            console.log(grund);
            let notificationRole;

            switch (grund) {
                case "Adminkontakt":
                    notificationRole = settings.admin;
                    break;
                case "Rennvorfall":
                    notificationRole = settings.fia;
                    break;
                default:
                    console.log("No notification role found");
            }
            const closeTicket = new ButtonBuilder()
            .setCustomId(`close-ticket|${newChannel.id}`)
            .setLabel('Ticket schließen')
            .setStyle(ButtonStyle.Danger)

            const row = new ActionRowBuilder()
                .addComponents(closeTicket)

            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle(`Ticket von ${interaction.user.tag}`)
                .setTimestamp()
                .addFields({ name: "Grund", value: grund })
                .setFooter({ text: 'Ticket' });

            newChannel.send({ embeds: [embed], content: `<@&${notificationRole}>`, components: [row] }); 
        }
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
        else if (interaction.customId.startsWith("reason-selection")) {
            const selectedReason = interaction.values[0]; // Get the selected value
            console.log(selectedReason);

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

            function handleRennvorfall(){
                console.log("Rennvorfall selected");
                const selectionRow = new UserSelectMenuBuilder()
                .setCustomId('rennvorfall')
                .setPlaceholder('Beschuldigter')
                .setMinValues(1)
                .setMaxValues(1)

                const selectionEmbed = new EmbedBuilder()
                .setColor(0x00ffff)
                .setTitle('Ticket Konfigurieren')
                .setDescription('Welcher Beschuldigter willst du informieren?')


                interaction.reply({ embeds: [selectionEmbed], components: [selectionRow], ephemeral: true })
            }
            async function handleAdminkontakt(){

            }
            async function handleBugReport(){
            }
            async function handleDnf(){

            }
        }

    }
}