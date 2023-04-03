const
    {SlashCommandBuilder, EmbedBuilder} = require("discord.js"),
    profileModel = require("../../schemas/profile.js");


module.exports = {

    data: new SlashCommandBuilder()
        .setName('user-info')
        .setDescription('Get information about a character')
        .addMentionableOption(
            option => option.setName('user')
                .setDescription('The user to get information about')
                .setRequired(false)
        ),

    async execute(interaction) {

        const
            user = interaction.options.getMentionable('user') || interaction.user,
            profileData = await profileModel.findOne({userID: user.id});

        if (!profileData) return await interaction.reply({
            content: ":negative_squared_cross_mark: That user does not have a profile",
            ephemeral: true
        });

        await interaction.reply({
            content: `:ballot_box_with_check: User exists, getting information...`,
            ephemeral: true
        });

        let
            characters = profileData.characters,
            activeCharacter = characters.active,
            character = characters[activeCharacter],

            xp = profileData.xp,
            rank = profileData.level,

            fights = character.stats.fights,
            wins = character.stats.wins,
            losses = character.stats.losses,
            draws = character.stats.draws;

        const embed = new EmbedBuilder()
            .setTitle(`${user.username}'s Profile`)
            .setThumbnail(user.avatarURL({format: "webp", dynamic: true, size: 32}))
            .setDescription(`> Active Character: ${activeCharacter}
            > Rank: ${rank}
            > XP: ${xp}
            
            **${activeCharacter}'s Fights**
            > Fights: ${fights}
            > Wins: ${wins}
            > Losses: ${losses}
            > Draws: ${draws}
            `)
            .setTimestamp()
            .setColor(0x00FF00);

        await interaction.editReply({embeds: [embed]});

    }

}
