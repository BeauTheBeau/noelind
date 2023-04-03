const
    {SlashCommandBuilder, EmbedBuilder} = require("discord.js"),
    profileModel = require("../../schemas/profile.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName('list-characters')
        .setDescription('List all your characters'),

    async execute(interaction) {

        const
            profileData = await profileModel.findOne({userID: interaction.user.id}),
            startedTime = Date.now();

        let
            characters = profileData.characters,
            charList = [];

        await interaction.reply({
            content: `:face_with_monocle: Checking if you have any characters...`,
            ephemeral: true
        });

        if (Object.keys(characters).length === 0) return await interaction.editReply({
            content: ":negative_squared_cross_mark: You do not have any characters",
            ephemeral: true
        });

        await interaction.editReply({
            content: `:ballot_box_with_check: You have ${Object.keys(characters).length - 1} characters, listing...`,
            ephemeral: true
        });

        let active = characters.active;

        for (const [key, value] of Object.entries(characters)) {
            if (key === 'active') continue;
            if (key === active) {
                charList.push(`:white_check_mark: **${value.name}** (active)`);
            } else {
                charList.push(`:x: **${value.name}**`);
            }
        }

        const embed = new EmbedBuilder()
            .setTitle(`Characters for ${interaction.user.username} | ${charList.length} characters`)
            .setDescription(charList.join('\n'))
            .setColor(0x00FF00)
            .setTimestamp();

        await interaction.editReply({
            embeds: [embed],
            ephemeral: true
        });

    }
}