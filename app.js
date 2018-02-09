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
var needInvitations = [];

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
    debug: true
});

const bot = controller.spawn({
    token: process.env.SLACK_API_TOKEN,
    retry: 30
}).startRTM(function(err, bot, payload) {
  adminNotify(bot, `Hello - I just connected!`)
  if (err) {throw new Error(err);}

  // Update the channels and users list on startup

  // @ https://api.slack.com/methods/users.list
  bot.api.users.list({}, function (err, response) {
    if (response.hasOwnProperty('members') && response.ok) {
      fullTeamList = response.members.map(x => ({name: x.name, id: x.id}))
    }
  });

  // @ https://api.slack.com/methods/channels.list
  bot.api.channels.list({}, function (err, response) {
    if (response.hasOwnProperty('channels') && response.ok) {
      fullChannelList = [...fullChannelList, ...response.channels.map(x => ({name: x.name, id: x.id}))]
      needInvitations = response.channels.filter(x => (!x.is_member)).map(x => `<#${x.id}>`)
      if (needInvitations.length != 0) {
        adminNotify(bot, `Hey! I need invitations to these channels in monitor them: ${needInvitations}`)  
      }
    }
  });

  // @ https://api.slack.com/methods/groups.list
  bot.api.groups.list({}, function (err, response) {
    if (response.hasOwnProperty('groups') && response.ok) {
      fullChannelList = [...fullChannelList, ...response.groups.map(x => ({name: x.name, id: x.id}))]
    }
  });

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

controller.hears('.*', 'direct_message,direct_mention,mention', function(bot, message) {
    bot.reply(message,getRandomItem(replies));
});

controller.on('file_share', (bot, msg) => {
  var tmpFile = `${tmpDir}/${getId()}-${msg.file.name}`
  var file = fs.createWriteStream(tmpFile)
  var authToken = {'bearer': process.env.SLACK_API_TOKEN}
  var req = request.get(msg.file.url_private_download, {'auth': authToken}).pipe(file)
  
  req.on('finish', function() {
    // Upload the file to flickr
    var flickr = new Flickr(flickrAuth);
    var defaultTags = [`Uploaded by ${msg.user_profile.display_name}`, 'BnH Slack']
    var channelNames = msg.file.channels.map(chanId => '#'+getNameFromId(chanId, fullChannelList))
    var groupNames = msg.file.groups.map(chanId => '#'+getNameFromId(chanId, fullChannelList))
    var upload = new Flickr.Upload(flickrAuth, tmpFile, {
      title: msg.file.title,
      description: (typeof msg.file.initial_comment === 'undefined') ? '' : msg.file.initial_comment.comment,
      tags: [...channelNames, ...groupNames, ...defaultTags].map(x => `"${x}"`).join(' ')
    });

    upload.then(function (res) {
      console.log('Successfully uploaded to Flickr');
      // Image uploaded successfully, now lets remove the file on disk
      fs.unlink(tmpFile, function(err) {
        if (err) console.log(err);
        console.log(`${tmpFile} removed`)
      })
      // add to album
      var ps = flickr.photosets.addPhoto({photoset_id: process.env.FLICKR_DEFAULT_ALBUM, photo_id: res.body.photoid._content})
      ps.then(function (res) {
        console.log('Added file to album', res.body);
      }).catch(function(err) {
        console.log('Something went wrong!', err);
      })
    }).catch(function (err) {
      console.error('Something went wrong', err);
    }); 
  })
})


//////// Helper functions
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

function getNameFromId(id, l) {
  x = l.find(x => x.id == id)
  return (typeof(x) == 'undefined') ? id : x.name
}
