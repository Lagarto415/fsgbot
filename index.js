import pkg from 'discord.js';
const { Client, IntentsBitField, PermissionsBitField } = pkg;

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMembers
    ],
})

let welcomeChannel;
let rulesChannel;
let driverApplicationsChannel;
let goodbyeChannel;
let modlog;

let testmode = false;

client.once('ready', () => {
    console.log('Bot is ready!');
    
    // Fetch the guild once the bot is ready
    const guild = client.guilds.cache.get('1132692146047176804'); // Assuming the bot is only in one guild


    if (guild) {
      welcomeChannel = guild.channels.cache.find(channel => channel.id === '1222236153369854064');
      rulesChannel = guild.channels.cache.find(channel => channel.id === '1182415636564025405');
      driverApplicationsChannel = guild.channels.cache.find(channel => channel.id === '1136539655580426241');
      goodbyeChannel = guild.channels.cache.find(channel => channel.id === '1224458292479393872');
      modlog = guild.channels.cache.find(channel => channel.id === '1145115156360200214');
  } else {
      console.error('Guild not found.');
  }

    const createCommand = async (commandData) => {
      try {
        await client.application?.commands.create(commandData);
      } catch (error) {
        console.error(error);
      }
    };
    
    const commands = [
      {
        name: 'kick',
        description: 'Kicks a user from the server',
        options: [
          {
            name: 'user',
            type: 6,
            description: 'The user to kick',
            required: true
          },
          {
            name: 'reason',
            type: 3,
            description: 'The reason for the kick',
            required: false
          }
        ]
      },
      {
        name: 'ban',
        description: 'Bans a user from the server',
        options: [
          {
            name: 'user',
            type: 6,
            description: 'The user to ban',
            required: true
          },
          {
            name: 'reason',
            type: 3,
            description: 'The reason for the ban',
            required: false
          }
        ]
      },
      {
        name: 'unban',
        description: 'Unbans a user from the server',
        options: [
          {
            name: 'user',
            type: 6,
            description: 'The user to unban',
            required: true
          }
        ]
      }
    ];
    commands.forEach(createCommand);
  }
);

//Join Embedd
client.on('guildMemberAdd', member => {
  const user = member.user.username;
  const embed = {
      color: 0x0099ff,
      title: `Willkommen in der F1-Simracing GER Liga, ${user}!`,
      timestamp: new Date(),
      image: {
          url: member.displayAvatarURL({ format: 'png', dynamic: false, size: 512 }), // User's profile picture URL
      }
  };

  if (rulesChannel && driverApplicationsChannel) {
      embed.description = `Bitte lies dir bei <#${rulesChannel.id}> die Regeln durch und bewirb dich als Fahrer bei <#${driverApplicationsChannel.id}>`;
      welcomeChannel.send({ embeds: [embed] })
          .catch(error => console.error('Error sending welcome message:', error));
  } else {
      console.error('Rules channel or driver applications channel not found.');
  }
});


//Leave Embed
client.on('guildMemberRemove', member => {
    const user = member.user.username;
    const embed = {
        color: 0x0099ff,
        title: ` ${user} hat die F1-Simracing GER Liga verlassen:`,
        timestamp: new Date(),
        image: {
            url: member.displayAvatarURL({ format: 'png', dynamic: false, size: 512 }), // User's profile picture URL
        }
    }
    if (goodbyeChannel){
        goodbyeChannel.send({ embeds: [embed] });
    } else {
        console.error('Goodbye channel not found.');
    }
})

//Kick Command
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName, options, user } = interaction; // Access the user property

  if (commandName === 'kick') {
      const targetUser = options.getUser('user');
      const reason = options.getString('reason') || 'No reason provided';
      
      if (!interaction.member.permissions.has('KICK_MEMBERS')) {
          return await interaction.reply({ content: 'Du darfst diesen Befehl nicht nutzen', ephemeral: true });
      }

      const memberToKick = interaction.guild.members.cache.get(targetUser.id);
      if (!memberToKick) {
          return await interaction.reply({ content: 'User kann nicht gekickt werden', ephemeral: true });
      }

      const embed = {
          color: 0xff0000,
          title: `${targetUser.tag} wurde gekickt`, // Use targetUser.tag instead of just user
          description: `Von: ${user.tag}\nGrund: ${options.getString('reason')}`, // Include the user who used the command
          timestamp: new Date()
      };

      await memberToKick.kick(reason);
      await interaction.reply({ content: `${targetUser.tag} wurde gekickt.`, ephemeral: true }); // Send an ephemeral reply to the user
      await modlog.send({ embeds: [embed] });
  }
  else if (commandName === 'ban') {
    const targetUser = options.getUser('user');
    const reason = options.getString('reason') || 'No reason provided';
    
    if (!interaction.member.permissions.has('BAN_MEMBERS')) {
        return await interaction.reply({ content: 'Du darfst diesen Befehl nicht nutzen', ephemeral: true });
    }

    const memberToBan = interaction.guild.members.cache.get(targetUser.id);
    if (!memberToBan) {
        return await interaction.reply({ content: 'User kann nicht gebannt werden', ephemeral: true });
    }

    const embed = {
        color: 0xff0000,
        title: `${targetUser.tag} wurde gebannt`, // Use targetUser.tag instead of just user
        description: `Von: ${user.tag}\nGrund: ${options.getString('reason')}`, // Include the user who used the command
        timestamp: new Date()
    };

    await memberToBan.ban({ reason });
    await interaction.reply({ content: `${targetUser.tag} wurde gebannt.`, ephemeral: true }); // Send an ephemeral reply to the user
    await modlog.send({ embeds: [embed] });
}
else if (commandName === 'unban') {
  // Check if the user has permission to unban members
  if (!interaction.member.permissions.has('BAN_MEMBERS')) {
    return await interaction.reply({ content: 'You do not have permission to unban members.', ephemeral: true });
  }

  // Get the user to unban
  const targetUser = options.getUser('user');
  if (!targetUser) {
    return await interaction.reply({ content: 'Please provide a valid user to unban.', ephemeral: true });
  }

  // Unban the user
  try {
    await interaction.guild.bans.remove(targetUser.id, options.getString('reason') || 'No reason provided');
  } catch (error) {
    console.error('Error unbanning user:', error);
    await interaction.reply({ content: 'An error occurred while unbanning the user.', ephemeral: true });
  }
  const embed = {
    color: 0xff0000,
    title: `${targetUser.tag} wurde entbannt`, // Use targetUser.tag instead of just user
    description: `Von: ${user.tag}\nGrund: ${options.getString('reason')}`, // Include the user who used the command
    timestamp: new Date()
};

client.on('messageCreate', async message => {
  if (message.content === '!ping') {
      // Reply with "Pong!"
      message.reply({content: 'Pong!', ephemeral: true});
  }
});

await interaction.reply({ content: `${targetUser.tag} wurde entbannt.`, ephemeral: true });
await modlog.send({ embeds: [embed] });
}
});

const finishedToken = "MTIyNDM4OTY5MDUxMDI3ODY5Ng.GYuLSh.K8zjBHnllvFDvsj9LJWQJZyFlseBe0ICBNzXT8";
const testToken = "MTIyNDczNDkwNjgxMTQxNjc0OA.GxYLkO.NuRXA_JGGBRtkxRKpjyC9KGaCgeF-9BGezaFOg"

client.login((testmode ? testToken : finishedToken));