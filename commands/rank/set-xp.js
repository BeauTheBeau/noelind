const
    {SlashCommandBuilder, PermissionFlagsBits} = require("discord.js"),
    profileModel = require("../../schemas/profile.js");

module.exports = {

    data: new SlashCommandBuilder()
        .setName('set-xp')
        .setDescription('Set the XP of a user')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMembers)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to set the XP of')
                .setRequired(true)
        )

        .addIntegerOption(option =>
            option.setName('xp')
                .setDescription('The amount of XP to set')
                .setRequired(true)
        ),

    async execute(interaction) {

        const
            user = interaction.options.getUser('user'),
            xp = interaction.options.getInteger('xp');

        const
            profileData = await profileModel.findOne({userID: user.id}),
            startedTime = Date.now();

        // set xp
        profileData.xp = xp;
        const
            rank = Math.floor(0.1 * Math.sqrt(xp)),
            untilNextRank = Math.pow((rank + 1) / 0.1, 2) - xp;
        profileData.rank = rank;

        try {

            await profileData.save();
            await interaction.reply({
                content: `:ballot_box_with_check: Set **${user.username}**'s XP to **${xp}** and rank to **${rank}**. They need **${untilNextRank}** XP to reach the next rank`,
                ephemeral: true
            });
        }
        catch (err) {
            await interaction.reply({
                content: `:negative_squared_cross_mark: An error occurred while setting **${user.username}**'s XP, please try again later`,
                ephemeral: true
            });
            console.log(err);
        }
    }
}