const { Client, GatewayIntentBits, Events } = require('discord.js');
const axios = require('axios');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Your Discord bot token
const TOKEN = process.env.TOKEN;

// Character definitions
const characters = {
    "Character1": {
        description: "Description for Character 1.",
        chatUrl: "YOUR_PERCHANCE_CHAT_URL_FOR_CHARACTER1",
    },
    "Character2": {
        description: "Description for Character 2.",
        chatUrl: "YOUR_PERCHANCE_CHAT_URL_FOR_CHARACTER2",
    },
    // Add more characters as needed
};

client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Register slash commands
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'create_thread') {
        const threadName = interaction.options.getString('name');
        const thread = await interaction.channel.threads.create({
            name: threadName,
            autoArchiveDuration: 60,
            type: 'GUILD_PRIVATE_THREAD',
        });
        await interaction.reply({ content: `Created a private thread: ${thread.url}`, ephemeral: true });

    } else if (commandName === 'chat') {
        const character = interaction.options.getString('character');
        if (!characters[character]) {
            return await interaction.reply({ content: 'Invalid character. Please choose from the specified list.', ephemeral: true });
        }
        const thread = await interaction.channel.threads.create({
            name: `Chat with ${character}`,
            autoArchiveDuration: 60,
            type: 'GUILD_PRIVATE_THREAD',
        });
        await interaction.reply({ content: `Started a chat thread with ${character}: ${thread.url}`, ephemeral: true });

    } else if (commandName === 'generate') {
        const prompt = interaction.options.getString('prompt');
        const thread = await interaction.channel.threads.create({
            name: `Image Generation`,
            autoArchiveDuration: 60,
            type: 'GUILD_PRIVATE_THREAD',
        });
        const imageUrl = await generateImage(prompt);
        await thread.send(`Generated Image: ${imageUrl}`);
        await interaction.reply({ content: `Started a new image generation thread: ${thread.url}`, ephemeral: true });

    } else if (commandName === 'character_info') {
        const character = interaction.options.getString('character');
        if (characters[character]) {
            await interaction.reply({ content: characters[character].description, ephemeral: true });
        } else {
            await interaction.reply({ content: 'Invalid character. Please choose from the specified list.', ephemeral: true });
        }
    }
});

// Function to generate an image based on a prompt
async function generateImage(prompt) {
    try {
        const response = await axios.post('YOUR_PERCHANCE_IMAGE_GENERATION_URL', { prompt }); // Adjust as needed
        return response.data.imageUrl; // Adjust based on response structure
    } catch (error) {
        console.error('Error generating image:', error);
        return 'Failed to generate image.';
    }
}

client.login(TOKEN);

// Register your commands globally when the bot starts
client.on(Events.ClientReady, async () => {
    const commands = [
        {
            name: 'create_thread',
            description: 'Create a private thread with a custom name',
            options: [
                {
                    name: 'name',
                    type: 'STRING',
                    description: 'The name for the private thread',
                    required: true,
                },
            ],
        },
        {
            name: 'chat',
            description: 'Start a chat with a specified character',
            options: [
                {
                    name: 'character',
                    type: 'STRING',
                    description: 'The character you want to chat with',
                    required: true,
                    choices: Object.keys(characters).map(character => ({ name: character, value: character })),
                },
            ],
        },
        {
            name: 'generate',
            description: 'Generate an image based on a prompt',
            options: [
                {
                    name: 'prompt',
                    type: 'STRING',
                    description: 'The prompt for image generation',
                    required: true,
                },
            ],
        },
        {
            name: 'character_info',
            description: 'Get a description of a specified character',
            options: [
                {
                    name: 'character',
                    type: 'STRING',
                    description: 'The character you want information about',
                    required: true,
                    choices: Object.keys(characters).map(character => ({ name: character, value: character })),
                },
            ],
        },
    ];

    // Register commands globally
    await client.application.commands.set(commands);
    console.log('Commands registered globally!');
});
