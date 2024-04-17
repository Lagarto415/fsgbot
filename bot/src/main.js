const { Client, IntentsBitField, Collection } = require('discord.js');

const fs = require('fs');
const path = require('path');
const axios = require('axios');

require('dotenv').config();

const client = new Client ({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMembers
    ],
})
client.commands = new Collection();

client.on('ready', () => {
    console.log(`Connection established! \nLogged in as User ${client.user.tag}!\nClient created at ${client.application.createdAt}\nCurrently in ${client.guilds.cache.size} Servers!`)
})

const utils = fs.readdirSync("./utils").filter(file => file.endsWith(".js"));
const events = fs.readdirSync("./events").filter(file => file.endsWith(".js"));
const commands = fs.readdirSync("./commands");

(async () => {
    for (file of utils) {
        require(`./utils/${file}`)(client);
    }
    console.log("TRIGGERED")
    client.handleEvents(events, "./src/events");
    client.handleCommands(commands, "./src/commands");
})();

const fsgToken = process.env.FSG_TOKEN
const testToken = process.env.TEST_TOKEN
console.log("TOKEN: "+ testToken)
client.login(testToken)