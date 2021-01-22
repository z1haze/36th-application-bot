require('dotenv').config();

const {Client, MessageCollector} = require('discord.js');
const BOT_TOKEN = process.env.BOT_TOKEN;
const client = new Client({partials: ['MESSAGE', 'REACTION']});
const questions = require('./questions.json');

let outputChannel;

client.on('ready', async () => {
    // eslint-disable-next-line no-console
    console.info(`Logged in as ${client.user.tag}!`);

    outputChannel = client.channels.cache.get(process.env.OUTPUT_CHANNEL_ID);
});

client.on('messageReactionAdd', async (messageReaction, user) => {
    if (messageReaction.message.id !== process.env.TRIGGER_MESSAGE_ID) {
        return;
    }

    let counter = 0;
    const channel = await user.createDM();

    // create a message collector for each application question response
    const collector = new MessageCollector(channel, (m) => m.author.id === user.id, {
        max : questions.length,
        time: 1000 * 60 * 20 // 20 minutes
    });

    // send the next question after receiving the answer for the previous question
    collector.on('collect', (m) => {
        if (counter < questions.length) {
            m.channel.send(`__Question ${counter+1} of ${questions.length}:__\n\n${questions[counter++]}`);
        }
    });

    // when the collector is finished, send a response and post the application in the correct channel
    collector.on('end', (collected) => {
        const application = Array.from(collected.values()).map((m, i) => {
            return `__${questions[i]}__\n${m.content}`;
        });

        channel.send('Thank you for your application. We will review your application soon. In the meanwhile, please visit the #reception channel if you have any questions');

        outputChannel.send(
            `Attention <@&${process.env.ALERT_ROLE_ID}>: <@${user.id}> submitted an application.` +
            '\n\n' +
            `${application.join('\n\n')}`
        );
    });

    channel.send(`__Question ${counter+1} of ${questions.length}:__\n\n${questions[counter++]}`);
});

client.login(BOT_TOKEN);