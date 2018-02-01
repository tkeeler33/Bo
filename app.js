if (!process.env.SLACK_API_TOKEN) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

const Botkit = require('botkit');

const controller = Botkit.slackbot({
    debug: true,
    json_file_store: 'history'
});

const bot = controller.spawn({
    token: process.env.SLACK_API_TOKEN
}).startRTM();

// Replies
const replies = [
  "*WOOF*", "_wags tail_", "Bark!", "_pants_",
  "_sits_", "*Grrrrrrrr*", "_shakes_", "*yawns*"
]

// store all conversations
controller.on(['ambient','direct_mention','mention','direct_message'], function(bot, message) {
    console.log(message);
});

controller.hears(['hello', 'hi'], 'direct_message,direct_mention,mention', function(bot, message) {
    bot.reply(message,getRandomItem(replies));
});




////////
// get random item from a Set
function getRandomItem(set) {
    let items = Array.from(set);
    return items[Math.floor(Math.random() * items.length)];
}
