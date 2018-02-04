if (!process.env.SLACK_API_TOKEN) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

const request = require('request')
const fs = require('fs')
const Botkit = require('botkit');
const Flickr = require('flickr-sdk');


const controller = Botkit.slackbot({
    debug: true,
    json_file_store: 'history',
    // studio_token: process.env.BOTKIT_STUDIO_TOKEN
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
// controller.on(['ambient','direct_mention','mention','direct_message'], function(bot, message) {
//     console.log(message);
// });

controller.hears(['hello', 'hi'], 'direct_message,direct_mention,mention', function(bot, message) {
    bot.reply(message,getRandomItem(replies));
});

controller.hears('.*', 'direct_message,direct_mention,mention', function(bot, message) {
    bot.reply(message,getRandomItem(replies));
});

controller.on('file_share', (bot, msg) => {
  console.log(msg);
  var file = fs.createWriteStream(msg.file.name)
  var authToken = {'bearer': process.env.SLACK_API_TOKEN}
  var req = request.get(msg.file.url_private_download, {'auth': authToken}).pipe(file)
  // Upload the file to flickr
  // var flickr_auth = new Flickr(Flickr.OAuth.createPlugin(
  //   process.env.FLICKR_API_KEY,
  //   process.env.FLICKR_API_SECRET,
  //   process.env.FLICKR_OAUTH_TOKEN,
  //   process.env.FLICKR_OAUTH_TOKEN_SECRET
  // ));
  // console.log(flickr_auth._);
  // var upload = new Flickr.Upload(flickr_auth._, msg.file.name, {
  //   title: 'Works on MY machine!'
  // });

  // upload.then(function (res) {
  //   console.log('yay!', res.body);
  // }).catch(function (err) {
  //   console.error('bonk', err);
  // });

})
// controller.on('direct_message,direct_mention,mention', function(bot, message) {
//     controller.studio.runTrigger(bot, message.text, message.user, message.channel).catch(function(err) {
//         bot.reply(message, 'I experienced an error with a request to Botkit Studio: ' + err);
//     });
// });

////////
// get random item from a Set
function getRandomItem(set) {
    let items = Array.from(set);
    return items[Math.floor(Math.random() * items.length)];
}
