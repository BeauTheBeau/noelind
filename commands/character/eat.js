const
    {SlashCommandBuilder, EmbedBuilder} = require("discord.js"),
    profileModel = require("../../schemas/profile");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eat')
        .setDescription('Eat food to heal (applies to current character'),

    async execute(interaction) {

        const
            profileData = await profileModel.findOne({userID: interaction.user.id});

        let
            characters = profileData.characters,
            activeChar = characters.active;

        // activeChar is a string, so we need to get the actual character object
        let
            character = characters[activeChar],
            health = character.health;

        // If health is below 25, we can not eat
        if (health[0] < 25) return await interaction.reply({
            content: ":negative_squared_cross_mark: Your health is too low to eat. Visit a Lekar to heal.",
        });

        // If health is at 100, we can not eat
        if (health[0] === 100) return await interaction.reply({
            content: ":negative_squared_cross_mark: Your health is already at 100%.",
        });

        // If health is above 25, we can eat
        if (health[0] > 25) {
            const
                HEALTH_GAIN = Math.floor(Math.random() * 25) + 1,
                HEALTH_AFTER = Math.ceil(health[0] + HEALTH_GAIN);

            if (HEALTH_AFTER > 100) character.health[0] = 100;
            if (HEALTH_AFTER <= 100) character.health[0] = HEALTH_AFTER;

            await interaction.reply({
                content: `:ballot_box_with_check: You ate some food and gained **${HEALTH_GAIN}** health.`,
            });
        }
    }
}