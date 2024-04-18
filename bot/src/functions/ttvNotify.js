const { EmbedBuilder } = require('discord.js')
const axios = require('axios');
const previousStreamStatus = {};

module.exports = (client) => {
    setInterval(async () => {
        const ttvChannels = ["f1_simracing_ger", "juqutsu"];
        const guild = client.guilds.cache.get('1121488994149081110');
        if (!guild) {
            console.error('Guild not found!');
            return;
        }

        console.log(guild.name)

        const ttvTextChannel = guild.channels.cache.get('1225841643123507333');
        if (!ttvTextChannel) {
            console.error('Text channel not found!');
            return;
        }

        for (const channel of ttvChannels) {
            try {

                const response = await axios.get(`https://api.twitch.tv/helix/streams?user_login=${channel}`, {
                    headers: {
                        'Client-ID': process.env.TWITCH_CLIENT_ID,
                        'Authorization': `Bearer ${process.env.TWITCH_BEARER_TOKEN}`
                    }
                });
                console.log(response)


                const currentStreamStatus = response.data.data.length > 0;
                const previousStream = previousStreamStatus[channel] || false;

                if (currentStreamStatus !== previousStream) {
                    if (currentStreamStatus) {
                        const stream = response.data.data[0].user_name;
                        const embed = new EmbedBuilder()
                        .setColor(0x6441a5)
                        .setTitle(`:red_circle: ${stream} ist jetzt live! :red_circle:`)
                        .setDescription(response.data.data[0].title + '\n' +` https://twitch.tv/${stream}`)
                        .setThumbnail(response.data.data[0].profile_image_url)
                        .setTimestamp();
                      
                        ttvTextChannel.send('@everyone')
                        ttvTextChannel.send({ embeds: [embed] });
                        console.log("Twitch stream detected: " + stream + " is now live.");
                    } else {
                        console.log("Twitch stream for channel " + channel + " is now offline.");
                    }
                    previousStreamStatus[channel] = currentStreamStatus;
                }
            } catch (error) {
                console.error("Error fetching Twitch status:", error);
            }
        }
    }, 15000);
};
