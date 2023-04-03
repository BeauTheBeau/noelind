const
    {SlashCommandBuilder} = require('discord.js'),
    profileModel = require('../../schemas/profile');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('lekar')
        .setDescription('Add/remove Lekar status to a character')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add Lekar status to a character')
                .addStringOption(option =>
                    option
                        .setName('character')
                        .setDescription('The character to add Lekar status to')
                        .setRequired(true)
                )
                .addMentionableOption(
                option => option
                    .setName('user')
                    .setDescription('The user to add Lekar status to')
                    .setRequired(true)
            )
        ).addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove Lekar status from a character')
                .addStringOption(option =>
                    option
                        .setName('character')
                        .setDescription('The character to remove Lekar status from')
                        .setRequired(true)
                )
                .addMentionableOption(
                option => option
                    .setName('user')
                    .setDescription('The user to remove Lekar status from')
                    .setRequired(true)
            )
        ),

    async execute(interaction) {

        const
            character = interaction.options.getString('character'),
            user = interaction.options.getMentionable('user'),
            subcommand = interaction.options.getSubcommand(),
            profileData = await profileModel.findOne({userID: user.id});

        let
            characters = profileData.characters;

        // Check if the character exists
        if (!characters[character]) return await interaction.reply({
            content: `:negative_squared_cross_mark: The character **${character}** does not exist.`,
        });

        if (subcommand === 'add') {

            // Check if the character already has Lekar status
            if (characters[character].isLekar === true) return await interaction.reply({
                content: `:negative_squared_cross_mark: The character **${character}** already has Lekar status.`,
            });

            try {
                characters[character].isLekar = true;
                await profileData.save();
            }
            catch (err) {
                console.log(err);
                return await interaction.reply({
                    content: `:negative_squared_cross_mark: There was an error adding Lekar status to the character **${character}**.`,
                });
            }

            await interaction.reply({
                content: `:ballot_box_with_check: The character **${character}** now has Lekar status.`,
            });
        }

        if (subcommand === 'remove') {

            // Check if the character has Lekar status
            if (characters[character].isLekar === false) return await interaction.reply({
                content: `:negative_squared_cross_mark: The character **${character}** does not have Lekar status.`,
            });

            try {
                characters[character].isLekar = false;
                await profileData.save();
            }
            catch (err) {
                console.log(err);
                return await interaction.reply({
                    content: `:negative_squared_cross_mark: There was an error removing Lekar status from the character **${character}**.`,
                });
            }

            await interaction.reply({
                content: `:ballot_box_with_check: The character **${character}** no longer has Lekar status.`,
            });

        }
    }
}