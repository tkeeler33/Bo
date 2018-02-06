if (!process.env.SLACK_API_TOKEN) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

const request = require('request')
const fs = require('fs')
const Botkit = require('botkit');
const Flickr = require('flickr-sdk');


// Slack setup
var fullTeamList = [];
var fullChannelList = [];

// Setup temp download directory
var tmpDir = './tmp'
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir)
}

// Fickr API Setup
var flickrAuth = Flickr.OAuth.createPlugin(
  process.env.FLICKR_API_KEY,
  process.env.FLICKR_API_SECRET,
  process.env.FLICKR_OAUTH_TOKEN,
  process.env.FLICKR_OAUTH_TOKEN_SECRET
);

const controller = Botkit.slackbot({
    debug: true,
    json_file_store: 'history',
    // studio_token: process.env.BOTKIT_STUDIO_TOKEN
});

const bot = controller.spawn({
    token: process.env.SLACK_API_TOKEN,
    retry: 30
}).startRTM(function(err, bot, payload) {
  // adminNotify(bot, `Hello <!channel> - I just connected!`)
  // adminNotify(bot, `Hello <!channel> - I just connected!`)
});

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
  var tmpFile = `${tmpDir}/${msg.file.name}-${getId()}`
  var file = fs.createWriteStream(tmpFile)
  var authToken = {'bearer': process.env.SLACK_API_TOKEN}
  var req = request.get(msg.file.url_private_download, {'auth': authToken}).pipe(file)
  
  req.on('finish', function() {
    // Upload the file to flickr
    var flickr = new Flickr(flickrAuth);
    var defaultTags = [`Uploaded by ${msg.user_profile.display_name}`, 'BnH Slack']
    var upload = new Flickr.Upload(flickrAuth, tmpFile, {
      title: msg.file.title,
      description: (typeof msg.file.initial_comment === 'undefined') ? '' : msg.file.initial_comment.comment,
      tags: [...msg.file.channels, ...msg.file.groups, ...defaultTags].map(x => `"${x}"`).join(' ')
      // tags: '"some space" "other space"'
    });

    upload.then(function (res) {
      console.log('yay!', res.body);
      // Image uploaded successfully, now lets remove the file on disk
      fs.unlink(tmpFile, function(err) {
        if (err) throw err;
        console.log(`${tmpFile} removed`)
      })
      // add to album
      var ps = flickr.photosets.addPhoto({photoset_id: process.env.FLICKR_DEFAULT_ALBUM, photo_id: res.body.photoid._content})
      ps.then(function (res) {
        console.log('added!', res.body);
      }).catch(function(err) {
        console.log('bonk', err);
      })
    }).catch(function (err) {
      console.error('bonk', err);
    }); 
  })
  

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

// random id creator
function getId() {
  return Math.random().toString(36).substr(2, 9);
}

function adminNotify(bot, msg) {
  bot.say({
    text: msg,
    channel: process.env.SLACK_ADMIN_CHANNEL
  })
}
