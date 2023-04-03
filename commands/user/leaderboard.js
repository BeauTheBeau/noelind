const
    {SlashCommandBuilder, EmbedBuilder} = require("discord.js"),
    profileModel = require("../../schemas/profile.js");


module.exports = {

    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Top 10 users in the server by XP'),

    async execute(interaction) {

            await interaction.reply({
                content: `:ballot_box_with_check: Getting leaderboard...`,
            });

            const profiles = await profileModel.find({}).sort({xp: -1}).limit(10);

            // wait 2 seconds

            let leaderboard = [];
            for (let i = 0; i < profiles.length; i++) {
                const profile = profiles[i];
                leaderboard.push(`**${i + 1}.** <@${profile.userID}> | ${profile.xp} XP`);
            }

            const embed = new EmbedBuilder()
                .setTitle(`Leaderboard`)
                .setDescription(leaderboard.join("\n"))
                .setTimestamp();

            await interaction.editReply({
                content: null,
                embeds: [embed],
            });
    }
}