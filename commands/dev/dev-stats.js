const
    {SlashCommandBuilder, EmbedBuilder} = require("discord.js"),
    mongoose = require('mongoose');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dev-stats')
        .setDescription('Get tech stats'),

    async execute(interaction) {

        const
            rss = process.memoryUsage().rss.toLocaleString() + "mb",
            heapTotal = process.memoryUsage().heapTotal.toLocaleString() + "mb",
            heapUsed = process.memoryUsage().heapUsed.toLocaleString() + "mb",
            external = process.memoryUsage().external.toLocaleString() + "mb",
            cpuUsage = process.cpuUsage(),
            cpuAvg = process.cpuUsage().user / process.cpuUsage().system.toPrecision(2),
            uptime = process.uptime().toLocaleString() + "s",
            os = process.platform + " " + process.arch,
            clientPing = interaction.client.ws.ping + "ms",
            dbPing = mongoose.connection.readyState + "ms";

        const embed = new EmbedBuilder()
            .setTitle(`Tech Stats`)
            .setDescription(`**RSS:** ${rss}\n**Heap Total:** ${heapTotal}\n**Heap Used:** ${heapUsed}\n**External:** ${external}\n
            **CPU Average:** ${cpuAvg.toPrecision(2)}%
            **Uptime:** ${uptime}
            **OS:** ${os}`)
            .setColor(0x00FF00)
            .setFooter({
                text: `Client Ping: ${clientPing} | DB Ping: ${dbPing}`

            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
        });
    }
}
