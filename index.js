import pkg from 'discord.js';
const { Client, IntentsBitField, MessageActionRow, MessageSelectMenu } = pkg;

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMembers
    ],
})

// client.on("messageCreate", async (message) => {
//     if (!message?.author.bot) {
//         message.author.send(`Echo ${message.content}`)
//     }
// })
let welcomeChannel;
let rulesChannel;
let driverApplicationsChannel;

client.once('ready', () => {
    console.log('Bot is ready!');
    
    // Fetch the guild once the bot is ready
    const guild = client.guilds.cache.first(); // Assuming the bot is only in one guild

    // Find the channels
    welcomeChannel = guild.channels.cache.find(channel => channel.name === 'willkommen');
    rulesChannel = guild.channels.cache.find(channel => channel.name === 'rules');
    driverApplicationsChannel = guild.channels.cache.find(channel => channel.name === 'fahrerbewerbungen');
});

//Join Embedd
client.on('guildMemberAdd', member => {
    const user = member.user.username;
    const embed = {
        color: 0x0099ff,
        title: `Willkommen in der F1-Simracing GER Liga, ${user}!`,
        description: `Bitte lies dir bei <#${rulesChannel.id}> die Regeln durch und bewirb dich als Fahrer bei <#${driverApplicationsChannel.id}>`,
        timestamp: new Date(),
        image: {
            url: member.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }), // User's profile picture URL
        }
    }

    welcomeChannel.send({ embeds: [embed] });
});

//Application Form
client.on('messageCreate', async message => {
    const questions = [
      "Name",
      "Lenkrad oder Controller",
      "KI Stärke",
      "Wunsch-Fahrernummer",
      "Wunschteam",
      "EA-ID"
    ];
  
    let answers = [];
    if (message.content === '!startform') {
      await message.reply("Lass uns mit der Bewerbung beginnen");
  
      for (const question of questions) {
        const options = [ // Define options for each question
          {
            label: "Option 1",
            value: "option1_value"
          },
          {
            label: "Option 2",
            value: "option2_value"
          },
          // Add more options as needed
        ];
  
        const selectMenu = new MessageSelectMenu()
          .setCustomId('select_option')
          .setPlaceholder(question) // Placeholder text before selection
          .setOptions(options);
  
        const row = new MessageActionRow().addComponents(selectMenu);
  
        await message.channel.send({ content: question, components: [row] });
      }
  
      const filter = i => i.user.id === message.author.id;
      const collector = message.channel.createMessageComponentCollector({ filter, time: 60000 });
  
      collector.on('collect', async interaction => {
        answers.push(interaction.values[0]); // Store the selected value
        await interaction.update({ content: `You selected: ${interaction.values[0]}`, components: [] });
      });
  
      collector.on('end', collected => {
        if (collected.size === 0) {
          message.channel.send('No response received.');
        }
      });
        

        message.channel.send("Thank you for completing the form! Here are your responses:");
        for (let i = 0; i < questions.length; i++) {
            message.channel.send(`${questions[i]}: ${answers[i]}`);
        }
    }
});

client.login("MTIyNDM4OTY5MDUxMDI3ODY5Ng.GHdwCI.CE4xzFblxTjIWqkZQFSDof4BhU1baxIqXQRIHU")