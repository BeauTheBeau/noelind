require('dotenv').config();

// get all from shares.js
const
    {Client, Events, GatewayIntentBits, fs, Collection} = require('./shared.js'),
    token = process.env.TOKEN,
    client = new Client({
        intents: Object.values(GatewayIntentBits).reduce((a, b) => a | b, 0),
    }),
    mongoose = require('mongoose'),
    profileModel = require("../schemas/profile.js");

// Database

function createProfile(userID) {

    // Setup user's profile
    // See ../schemas/profile.js

    let profile = new profileModel({
        userID: userID,
        xp: 0,
        level: 0,
        characters: {active: null},
        inventory: {},
        combat: {active: false, combatID: null}
    });

    profile.save().catch(err => console.log(err));
}

client.on(Events.InteractionCreate, async interaction => {

    let profileData;

    try {
        profileData = await profileModel.findOne({userID: interaction.user.id});
        if (!profileData) {
            await interaction.reply(`You don't have a profile, but we're creating one for you now!`);
            await createProfile(interaction.user.id);
            await interaction.editReply(`Profile created!`);
        }
    } catch (err) {
        console.log(err);
    }


    switch (interaction.type) {

        case 2:
            const command = client.commands.get(interaction.commandName);

            try {
                console.log(`Executing command ${interaction.commandName} for ${interaction.user.tag} (${interaction.user.id})`);
                await command.execute(interaction);
                console.log(`> Command ${interaction.commandName} executed successfully!`);
            } catch (error) {
                console.error(`> Failed to execute command ${interaction.commandName}!`);
                console.error(`> ${error}`);

                await interaction.reply({
                    content: `There was an error while executing this command! Error: \`\`\`${error.stack}\`\`\``,
                    ephemeral: true
                });
            }
            break;

        case 3:
            // Handle button presses
            break;
        case 5:
            // Handle modals
            break;
    }
});


// Commands

client.commands = new Collection();

async function load_commands(category) {
    const
        directory = `../commands/${category}/`;

    try {
        const
            files = await fs.promises.readdir(directory);

        for (const file of files) {
            try {

                console.log(`Loading command ${category}/${file}...`);

                const
                    command = require(`${directory}${file}`),
                    command_name = file.split('.')[0];

                client.commands.set(command_name, command);
                console.log(`> Loaded command ${file} as ${command_name}`);
            } catch (err) {
                console.log(`> Failed to load command ${file}!`);
                console.error(err);
            }
        }
    } catch (err) {
        console.log(`> Failed to read directory ${directory}!`);
        console.error(err);
    }
}

// Log in to Discord with env
client.login(token).then(r =>
    console.log(r)
).catch(e =>
    console.error('> Failed to log in!', e)
);

let
    DB_CONNECTION_TRIES = 0;

async function connectToDatabase() {


    console.log("Connecting to database...");

    try {
        mongoose.set("strictQuery", true);
        mongoose.connect(process.env.MONGODB_SRC, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch (err) {
        console.error(err);
        // Try reconnecting to database
        if (DB_CONNECTION_TRIES < 5) {
            console.log(`> Retrying connection to database... ${DB_CONNECTION_TRIES + 1}/5`);
            DB_CONNECTION_TRIES++;
            await connectToDatabase();
        }
    }
}

client.once(Events.ClientReady, c => {
    console.log(`> Ready! Logged in as ${c.user.tag}`);
    console.log();

    connectToDatabase()
        .then(() => {
            console.log('> Connected to MongoDB!')
            console.log()
            console.log("> Loading commands...");

            // Loop through all sub-folders in commands and load all commands
            const categories = fs.readdirSync('../commands/');
            for (const category of categories) {
                load_commands(category).then(r =>
                    console.log(`> Loaded all commands in ${category}!\n`)
                ).catch(e =>
                    console.error(`> Failed to load commands in ${category}!`)
                );
            }

        }).catch((err) => {

        console.log('> There was an error')
        console.error(err)
    });
});


client.on('guildMemberAdd', async member => {

    // Setup user's profile

    /*
        Schema for reference
        userID: {type: String, required: true, unique: true}
        xp: {type: Number, default: 0}
        level: {type: Number, default: 0}
        characters: {type: Object, default: {active: null,}}
        inventory: {type: Object, default: {}}
        combat: {type: Object, default: {active: false, combatID: null}}
     */

    const
        profileModel = require('../schemas/profile.js');

    // Create profile from schema
    const profile = new profileModel({
        userID: member.id,
        xp: 0,
        level: 0,
        characters: {active: null},
        inventory: {},
        combat: {active: false, combatID: null}
    });

    console.log(`Creating profile for ${member.user.tag}...`);

    // Save profile to database
    await profile.save().then(() => {
        console.log(`> Created profile for ${member.user.tag}`);
    }).catch((err) => {
        console.log("> Failed to create profile for " + member.user.tag);
        console.error(`> ${err}`);
    });

});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.guild) return;

    // Get user's profile
    const
        author = message.author,
        profileData = await profileModel.findOne({userID: author.id}),
        xpGainCap = 90;

    if (!profileData) createProfile(author.id);

    let xpToAdd = Math.floor(Math.random() * 29) + 1;
    if (xpToAdd > xpGainCap) xpToAdd = xpGainCap;

    profileData.xp += xpToAdd;
    await profileData.save().catch(err => console.log(err));
});


process.on('uncaughtException', function (error) {
    console.log(error.stack);
});

