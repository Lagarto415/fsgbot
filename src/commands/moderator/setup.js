const { SlashCommandBuilder } = require("discord.js");
const uploadSetup = require("../../modules/uploadSetup");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup the FSG Bot')
        .addChannelOption(
            option => option
                .setName('welcome-channel')
                .setDescription('Channel where new members are welcomed')
                .setRequired(false)
        )
        .addChannelOption(
            option => option
                .setName('mod-log-channel')
                .setDescription('Channel where moderator logs are sent')
                .setRequired(false)
        )
        .addChannelOption(
            option => option
                .setName('leave-channel')
                .setDescription('Channel to say goodbye to members who left')
                .setRequired(false)
        )
        .addChannelOption(
            option => option
                .setName('socials-channel')
                .setDescription('Channel where TTV/YT notifications are sent')
                .setRequired(false)
        )
        .addChannelOption(
            option => option
                .setName('rules')
                .setDescription('Channel where the rules are')
                .setRequired(false)
        )
        .addChannelOption(
            option => option
                .setName('application')
                .setDescription('Channel for new applications')
                .setRequired(false)
        )
        .addChannelOption(
            option => option
                .setName('numbers')
                .setDescription('Channel for numbers')
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply({ content: 'Setting up...', ephemeral: true });

        const welcomeChannel = interaction.options.getChannel('welcome-channel');
        const leaveChannel = interaction.options.getChannel('leave-channel');
        const modLogChannel = interaction.options.getChannel('mod-log-channel');
        const socialsChannel = interaction.options.getChannel('socials-channel');
        const rulesChannel = interaction.options.getChannel('rules');
        const applicationChannel = interaction.options.getChannel('application');
        const numbersChannel = interaction.options.getChannel('numbers');

        const ChannelIds = {
            guildId: interaction.guild.id,
            welcome: welcomeChannel ? welcomeChannel.id : null,
            leave: leaveChannel ? leaveChannel.id : null,
            modLog: modLogChannel ? modLogChannel.id : null,
            socials: socialsChannel ? socialsChannel.id : null,
            rules: rulesChannel ? rulesChannel.id : null,
            application: applicationChannel ? applicationChannel.id : null,
            numbers: numbersChannel ? numbersChannel.id : null
        };          
    
        await uploadSetup(ChannelIds);

        await interaction.editReply({ content: 'Setup complete!', ephemeral: true })
    }
}