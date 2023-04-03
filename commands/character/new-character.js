const
    {SlashCommandBuilder} = require("discord.js"),
    profileModel = require("../../schemas/profile.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName('new-character')
        .setDescription('Create a new character')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The name of the character')
                .setRequired(true)
        ),

    async execute(interaction) {

        const
            charName = interaction.options.getString('name'),
            profileData = await profileModel.findOne({userID: interaction.user.id}),
            startedTime = Date.now();

        let characters = profileData.characters;

        await interaction.reply({
            content: `:face_with_monocle: Checking if character **${charName}** already exists...`,
            ephemeral: true
        });

        if (characters[charName]) return await interaction.editReply({
            content: ":negative_squared_cross_mark: You already have a character with that name",
            ephemeral: true
        });

        await interaction.editReply({
            content: `:ballot_box_with_check: Character does not exist, creating...`,
            ephemeral: true
        });

        // create the character
        characters[charName] = {
            name: charName,
            rank: [0, 1], // xp, rank
            isLekar: false,
            health: [100, 100], // current, max
            stats: {
                fights: 0,
                wins: 0,
                losses: 0,
                draws: 0,
                surrender: 0
            },
            last: {
                ate: null,
                fight: null,
                win: null,
                loss: null,
                draw: null,
                surrender: null
            }
        }

        try {
            await profileModel.updateOne({userID: interaction.user.id}, {$set: {characters: characters}});
            await interaction.editReply({
                content: `:white_check_mark: Created character **${charName}**! Took ${Date.now() - startedTime}ms`,
                ephemeral: true
            });
        } catch (err) {
            console.error(err);
            await interaction.editReply({
                content: ":negative_squared_cross_mark: Error creating character. Please try again later.",
                ephemeral: true
            });
        }
    }
}