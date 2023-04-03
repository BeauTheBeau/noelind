const
    {SlashCommandBuilder} = require("discord.js"),
    profileModel = require("../../schemas/profile.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName('active-character')
        .setDescription('Set your active character')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The name of the character')
                .setRequired(true)
        ),

    async execute(interaction) {

        const
            charName = interaction.options.getString('name'),
            profileData = await profileModel.findOne({userID: interaction.user.id});

        let characters = profileData.characters;

        if (!characters[charName]) return await interaction.reply({
            content: ":negative_squared_cross_mark: You do not have a character with that name",
            ephemeral: true
        });

        await interaction.reply({
            content: `:ballot_box_with_check: Character exists, setting as active...`,
            ephemeral: true
        });


        // set the character as active
        profileData.characters.active = charName;

        try {
            await profileModel.updateOne(
                { userID: interaction.user.id },
                { $set: { characters: profileData.characters } }
            );

            await interaction.editReply({
                content: `:ballot_box_with_check: Character **${charName}** set as active`,
                ephemeral: true
            });

        } catch (err) {
            await interaction.editReply({
                content: `:negative_squared_cross_mark: An error occurred while setting your active character, please try again later`,
                ephemeral: true
            });
            console.log(err);
        }
    }
}
