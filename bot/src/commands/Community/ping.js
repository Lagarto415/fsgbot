const { SlashCommandBuilder } = require('discord.js')
const fs = require('fs')
const path = require('path')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check for Bot availability'),

    async execute(interaction) {
        let pingJSON = []

        try {
          const response = await fs.readFileSync('src/data/pingAnswers.json')
          pingJSON = JSON.parse(response);
      } catch (error) {
          console.error('Error fetching JSON:', error);
          await interaction.reply('Error loading ping answers.');
          return; // Stop further execution if there's an error
      }
    
        const randomIndex = Math.floor(Math.random() * pingJSON.length);
        const randomAnswer = pingJSON[randomIndex].replace("USER", interaction.user);

        await interaction.reply({content: randomAnswer, ephemeral: false})
    }
}