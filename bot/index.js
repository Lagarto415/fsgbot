import pkg from 'discord.js';
const { Client, IntentsBitField, MessageActionRow, MessageButton, MessageSelectMenu } = pkg;
import axios from 'axios';
import fs from 'fs/promises';
import { response } from 'express';

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMembers
    ],
})

let ttvTextChannel;
let welcomeChannel;
let rulesChannel;
let driverApplicationsChannel;
let goodbyeChannel;
let modlog;
let numberchannel;

let bewerberRole;

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
      ttvTextChannel = guild.channels.cache.find(channel => channel.id === '1145413393122066482');
      bewerberRole = guild.roles.cache.find(role => role.id === '1145125128724815912');
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
      },
      {
        name: 'profilepicture',
        description: 'Sends you the Profile Picture of a user',
        options: [
          {
            name: 'user',
            type: 6,
            description: 'The user to get the profile picture of',
            required: true
          }
        ]
      }
    ];
    commands.forEach(createCommand);
  });

let previousStreamStatus = {}; // Object to store previous stream statuses
const ttvChannels = ["f1_simracing_ger"];
async function checkTtvStatus() {
  for (const channel of ttvChannels) {
    try {
      const response = await axios.get(`https://api.twitch.tv/helix/streams?user_login=${channel}`, {
        headers: {
          'Client-ID': '9a7z3n87vkdu83vyw3ch7lxrs244s1', // Replace with your actual Client ID
          'Authorization': 'Bearer 9cgjloqhlf0798vfau9q6osqu4aajs'
        }
      });

      const currentStreamStatus = response.data.data.length > 0;
      const previousStream = previousStreamStatus[channel] || false;

      // Check if the current status is different from the previous status
      if (currentStreamStatus !== previousStream) {
        if (currentStreamStatus) {
          const stream = response.data.data[0].user_name;
          const embed = {
            color: 0x00a31b,
            title: `:red_circle: ${stream} ist jetzt live! :red_circle:`,
            description: response.data.data[0].title + '\n' +` https://twitch.tv/${stream}`,
            timestamp: new Date(),
            image: {
                url: 'https://media.discordapp.net/attachments/1224731046097059853/1224733171770462259/IMG_0923.jpg?ex=661e90a6&is=660c1ba6&hm=c473e8806c40907d49d075cc07e38fdfab742353c90e76c1865831fe0f06a06b&=&format=webp&width=853&height=905', // User's profile picture URL
            }};
          ttvTextChannel.send('@everyone');
          ttvTextChannel.send({ embeds: [embed] });
          console.log("Twitch stream detected: " + stream + " is now live.");
        } else {
          console.log("Twitch stream for channel " + channel + " is now offline.");
        }
      }

      // Update the previous stream status
      previousStreamStatus[channel] = currentStreamStatus;
    } catch (error) {
      console.error("Error fetching Twitch status:", error);
    }
  }
}
checkTtvStatus();
setInterval(checkTtvStatus, 15000);

const storageFilePath = './latestVideoIds.json';

async function loadLatestVideoIds() {
  try {
      const data = await fs.readFile(storageFilePath);
      latestVideoIds = JSON.parse(data);
  } catch (error) {
      console.error('Error loading latest video IDs:', error);
  }
}

async function saveLatestVideoIds() {
  try {
      await fs.writeFile(storageFilePath, JSON.stringify(latestVideoIds, null, 2));
  } catch (error) {
      console.error('Error saving latest video IDs:', error);
  }
}

const ytChannels = ['UCC84JzpzGMObPZcsB0Ywu5g'];
const API_KEY = 'AIzaSyBObApGkmUHzi57qjPsRRPpw4YvLFYGH4c';

// Object to store the latest video ID for each channel
let latestVideoIds = {};

async function checkYT() {
  for (const channel of ytChannels){
    try {
      const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
        params: {
          key: API_KEY,
          channelId: channel,
          part: 'snippet',
          order: 'date',
          type: 'video'
        }
      });
      console.log("Connected to YouTube")
  
      const videos = response.data.items;
      if (videos.length > 0) {
        const latestVideo = videos[0];
        const videoId = latestVideo.id.videoId;
  
        // Check if the latest video ID is different from the stored one
        if (latestVideoIds[channel] !== videoId) {
          latestVideoIds[channel] = videoId;
          
          const videoTitle = latestVideo.snippet.title;
          const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

          const embed = {
            color: 0x00a31b,
            title: `:arrow_forward: Ein neues YouTube Video ist online!`,
            description: videoTitle + '\n' + videoUrl,
            timestamp: new Date(),
            image: {
                url: latestVideo.snippet.thumbnails.high.url, // User's profile picture URL
            }};
          ttvTextChannel.send("@everyone");
          ttvTextChannel.send({ embeds: [embed] });
  
          // Send notification to Discord server or perform any other action
          console.log(`New video uploaded: ${videoTitle}\n${videoUrl}`);
        }
      }
    } catch (error) {
      console.log(response.data)
      console.error('Error fetching new videos:', error);
    }
  }

  await saveLatestVideoIds();
}

loadLatestVideoIds();
setInterval(checkYT,10 * 60 * 1000);

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
      member.roles.add(bewerberRole);
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

await interaction.reply({ content: `${targetUser.tag} wurde entbannt.`, ephemeral: true });
await modlog.send({ embeds: [embed] });
}
else if (commandName === 'profilepicture') {
  const targetUser = options.getUser('user');
  if (!targetUser) {
    return await interaction.reply({ content: 'Please provide a valid user to fetch their profile picture.', ephemeral: true });
  }
  else {
    const userAvatarURL = targetUser.displayAvatarURL({ format: 'png', dynamic: true, size: 512 });

    // Send the user's profile picture as an image attachment
    await interaction.reply({ files: [userAvatarURL] })
      .then(() => console.log('Sent the user\'s profile picture'))
      .catch(console.error);
  }
}
});

client.on('messageCreate', async message => {
  const pingAnswers = [
    `Ich hoffe ${message.author.displayName} rutschen die Ärmel beim Händewaschen runter.`,
    `Ich hoffe ${message.author.displayName} morgen langsames Internet.`,
    `Ich hoffe ${message.author.displayName} vergisst sein wichtigstes Passwort.`,
    `Ich hoffe das Handy von ${message.author.displayName} hat keinen Akku mehr, wenn er ein schönes Foto machen möchte.`,
    `Ich hoffe der Stift von ${message.author.displayName} schreibt nicht mehr, wenn er ihn das nächste Mal braucht.`,
    `Ich hoffe, dass die Fortsetzung der Lieblingsserie von ${message.author.displayName} um ein Jahr verschoben wird.`,
    `Ich hoffe der Wecker von ${message.author.displayName} klingelt dann, wenn der Traum am schönsten ist.`,
    `Ich hoffe, dass ${message.author.displayName} keinen Sitzplatz im Bus bekommt.`,
    `Ich hoffe ${message.author.displayName} hat einen kleinen Stein im Schuh und keine Zeit ihn rauszunehmen.`,
    `Ich hoffe ${message.author.displayName} wird angerufen, wenn er gerade sein Lieblingsessen essen wollte.`,
    `Ich hoffe die Wasserflasche von ${message.author.displayName} ist immer dann leer, wenn er richtig durst hat.`,
    `Ich hoffe das Internet von ${message.author.displayName} stürzt in der letzten Runde des nächsten Rennens ab.`,
    `Ich hoffe die Bahn die ${message.author.displayName} immer nimmt, fällt aus.`,
    `Ich hoffe wenn ${message.author.displayName} das nächste Mal Bus fährt, steigt ein ganzer Kindergarten ein.`
  ];
  
  if (message.content === '!ping') {
    const randomIndex = Math.floor(Math.random() * pingAnswers.length);
    const randomAnswer = pingAnswers[randomIndex];
    message.reply({ content: randomAnswer, ephemeral: true });
    console.log('Pinged successfully!');
  } else if (message.content === '!db') {
    const data = await fetchData();
    const names = data.map(entry => entry.name).join(', ');
    message.reply({ content: names, ephemeral: true });
  }
});

async function fetchData() {
  try {
      const response = await fetch('http://localhost:3000/api/data');
      if (!response.ok) {
          throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      return data;
  } catch (error) {
      throw new Error('Failed to fetch data');
  }
}

const finishedToken = "MTIyNDM4OTY5MDUxMDI3ODY5Ng.GYuLSh.K8zjBHnllvFDvsj9LJWQJZyFlseBe0ICBNzXT8";

client.login(finishedToken);