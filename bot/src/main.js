const { Client, IntentsBitField, Collection, Partials } = require('discord.js');

const fs = require('fs');
const path = require('path');
const axios = require('axios');

require('dotenv').config();

const client = new Client ({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildPresences,
    ],
    partials: [Partials.Message, Partials.Channel]
})
client.commands = new Collection();

client.on('ready', () => {
    console.log(`Connection established! \nLogged in as User ${client.user.tag}!\nClient created at ${client.application.createdAt}\nCurrently in ${client.guilds.cache.size} Servers!`)
    const ttvNotify = require('./functions/ttvNotify')(client);
    const ytNotify = require('./functions/ytNotify')(client);
})

const functions = fs.readdirSync("./src/functions").filter(file => file.endsWith(".js"));
const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./src/commands");

(async () => {
    for (file of functions) {
        require(`./functions/${file}`)(client);
    }
    client.handleEvents(eventFiles, "./src/events");
    client.handleCommands(commandFolders, "./src/commands");
})();
const fsgToken = process.env.FSG_TOKEN;
const testToken = process.env.TEST_TOKEN;

client.login(testToken)