const { EmbedBuilder } = require('discord.js')
const axios = require('axios');
const { loadSettings } = require('../events/guildMemberAdd');
const fs = require('fs');

const storageFilePath = './src/data/latestVideoIds.json';
let latestVideoIds = {};

const ytChannels = ['UCC84JzpzGMObPZcsB0Ywu5g'];

module.exports = (client) => {
    setInterval(async () => {
        for (const channel of ytChannels){
            try {
              const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
                params: {
                  key: process.env.API_KEY,
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
        
                    const embed = new EmbedBuilder()
                    .setColor(0x00a31b)
                    .setTitle(`:arrow_forward: Ein neues YouTube Video ist online!`)
                    .setDescription(videoTitle + '\n' + videoUrl)
                    .setThumbnail(latestVideo.snippet.thumbnails.high.url)
                    .setTimestamp();
                    client.guilds.cache.forEach(element => {
                        const guild = client.guilds.cache.get(element.id);
                        const ttvTextChannel = guild.channels.cache.get(loadSettings(guild.id).ttv)
                        ttvTextChannel.send({ embeds: [embed], content: '@everyone' });
                    });
          
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
    }, 15 * 60 * 1000);
}

loadLatestVideoIds();

async function loadLatestVideoIds() {
    try {
        const data = await fs.readFileSync(storageFilePath);
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