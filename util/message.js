const {MessageEmbed} = require('discord.js');

function createEmbed () {
    return new MessageEmbed()
        .setColor('#cd1c1c')
        .setTitle('The Fighting 36th New Recruit Application')
        .setThumbnail('https://thefighting36th.com/img/android-chrome-512x512.png')
        .setDescription(`
            Hello, thank you for showing interest in joining The Fighting 36th! Before you apply, please first read through our community rules in <#${process.env.RULES_CHANNEL_ID}>.
            
            After reading the rules, if you still wish to apply to the unit, react to this message. Next, our Application Manager bot will send the application questions to your DM. You must complete the application within a 20 minute time period.
            
            After reviewing your application, a member of our introduction team will reach out to you in <#${process.env.RECEPTION_CHANNEL_ID}> for next steps.
        `);
}

module.exports = {
    createEmbed
};