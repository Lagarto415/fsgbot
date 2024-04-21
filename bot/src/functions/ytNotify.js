const { EmbedBuilder } = require('discord.js')
const axios = require('axios');
const fs = require('fs').promises;
const loadSettings = require("../functions/loadSettings");

const storageFilePath = './src/data/latestVideoIds.json';
let latestVideoIds = {};

const ytChannels = ['UCC84JzpzGMObPZcsB0Ywu5g'];

module.exports = (client) => {
    setInterval(async () => {
        for (const channel of ytChannels){
            try {
              const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
                params: {
                  key: process.env.YT_KEY,
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

                if (latestVideoIds[channel] !== videoId) {
                  latestVideoIds[channel] = videoId;
                  
                    const videoTitle = latestVideo.snippet.title;
                    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        
                    const embed = new EmbedBuilder()
                    .setColor(0x00a31b)
                    .setTitle(`:arrow_forward: Ein neues YouTube Video ist online!`)
                    .setImage(latestVideo.snippet.thumbnails.high.url)
                    .setDescription(videoTitle + '\n' + videoUrl)
                    .setTimestamp();
                    client.guilds.cache.forEach(element => {
                        const guild = client.guilds.cache.get(element.id);
                        const ttvTextChannel = guild.channels.cache.get(loadSettings(guild.id).channels.ttv)
                        ttvTextChannel.send({ embeds: [embed], content: `@everyone`, });
                    });
          
                  console.log(`New video uploaded: ${videoTitle}\n${videoUrl}`);
                  await saveLatestVideoIds();
                }
              }
            } catch (error) {
              console.error('Error fetching new videos:', error);
            }
          }        
    }, 15 * 60 * 1000);
}

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

  loadLatestVideoIds();