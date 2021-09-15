require('dotenv').config();

const {Client} = require('discord.js');
const monitor = require('./util/sentry');
const questions = require('./questions.json');
const {createEmbed} = require('./util/message');

const BOT_TOKEN = process.env.BOT_TOKEN;

let TRIGGER_MESSAGE_ID = null;

monitor.init();

const client = new Client({
    intents : ['GUILDS', 'GUILD_MESSAGE_REACTIONS', 'GUILD_EMOJIS_AND_STICKERS', 'DIRECT_MESSAGES'],
    partials: ['MESSAGE', 'REACTION', 'CHANNEL']}
);

let outputChannel;

client.on('ready', async () => {
    // eslint-disable-next-line no-console
    console.info(`Logged in as ${client.user.tag}!`);

    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    if (!guild) {
        throw new Error(`Guild with ID ${process.env.GUILD_ID} not found`);
    }

    // update channels cache
    await guild.channels.fetch();

    // fetch existing trigger channel
    const triggerChannel = client.channels.cache.get(process.env.TRIGGER_CHANNEL_ID);

    if (!triggerChannel) {
        throw new Error(`Channel with ID ${process.env.TRIGGER_CHANNEL_ID} not found`);
    }

    // attempt to find the trigger message
    const messages = await triggerChannel.messages.fetch();
    const triggerMessage = messages.find((m) => m.author.id === client.user.id);

    // create the trigger message
    if (!triggerMessage) {
        const embed = createEmbed();
        const triggerMessage = await triggerChannel.send({embeds: [embed]});

        TRIGGER_MESSAGE_ID = triggerMessage.id;

        await triggerMessage.react(process.env.REACTION_EMOJI_ID);
    } else {
        TRIGGER_MESSAGE_ID = triggerMessage.id;
    }

    outputChannel = client.channels.cache.get(process.env.OUTPUT_CHANNEL_ID);
});

/**
 * Initialize a new application
 */
client.on('messageReactionAdd', async (messageReaction, user) => {
    if (messageReaction.message.id !== TRIGGER_MESSAGE_ID || user.bot) {
        return;
    }

    let counter = 0;
    const dmChannel = await user.createDM();

    // create a message collector for each application question response
    const messageCollector = dmChannel.createMessageCollector({
        filter: (message) => message.author.id === user.id,
        max   : questions.length,
        time  : 1000 * 60 * 60 // 1 hour
    });

    // send the next question after receiving the answer for the previous question
    messageCollector.on('collect', () => {
        if (counter < questions.length) {
            dmChannel.send(`__Question ${counter + 1} of ${questions.length}:__\n\n${questions[counter++]}`);
        }
    });

    // when the collector is finished, send a response and post the application in the correct channel
    messageCollector.on('end', async (collected) => {
        if (collected.size < questions.length) {
            return;
        }
        
        const application = Array.from(collected.values()).map((m, i) => {
            return `__${questions[i]}__\n${m.content}`;
        });

        await dmChannel.send('Thank you for your application. We will review your application soon. In the meanwhile, please visit the #reception channel if you have any questions');

        const parts = application.join('\n\n').match(/[\s\S]{1,2000}$/gm);

        if (parts && parts.length) {
            await outputChannel.send(`Attention <@&${process.env.ALERT_ROLE_ID}>: <@${user.id}> submitted an application.`);
            await outputChannel.send('‎');

            for (let i = 0; i < parts.length; i++) {
                await outputChannel.send(parts[i]);
            }
        }

        const guildMember = await messageReaction.message.guild.members.fetch(user.id);

        // add the processing role
        if (guildMember && !guildMember.roles.cache.has(process.env.PROCESSING_ROLE_ID)) {
            const role = guildMember.guild.roles.cache.get(process.env.PROCESSING_ROLE_ID);

            await guildMember.roles.add(role);
        }
    });

    await dmChannel.send(`__Question ${counter + 1} of ${questions.length}:__\n\n${questions[counter++]}`);
});

client.login(BOT_TOKEN);