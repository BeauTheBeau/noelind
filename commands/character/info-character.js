const
    {SlashCommandBuilder, EmbedBuilder} = require("discord.js"),
    profileModel = require("../../schemas/profile.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName('info-character')
        .setDescription('Get information about a character')
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

        if (!characters[charName]) return await interaction.reply({
            content: ":negative_squared_cross_mark: You do not have a character with that name",
            ephemeral: true
        });

        await interaction.reply({
            content: `:ballot_box_with_check: Character exists, getting information...`,
            ephemeral: true
        });

        let character = characters[charName];
        const embed = new EmbedBuilder()
            .setTitle(`Character: ${character.name}`)
            .setDescription(`Rank: ${character.rank[1]}
            XP: ${character.rank[0]}
            
            **Fights**
            Fights: ${character.stats.fights}
            Wins: ${character.stats.wins}
            Losses: ${character.stats.losses}
            Draws: ${character.stats.draws}
            Times Surrendered: ${character.stats.surrender}
            
            **Time since last...**
            Ate: ${character.last.ate}
            Fight: ${character.last.fight}
            Win: ${character.last.win}
            Loss: ${character.last.loss}
            Draw: ${character.last.draw}
            Surrender: ${character.last.surrender}
            `)
            .setTimestamp()
            .setColor(0x00FF00);


            
        
        await interaction.editReply({
            content: `:ballot_box_with_check: Character **${charName}** exists, here is the information:`,
            embeds: [embed],
            ephemeral: true
        });
    }
}
