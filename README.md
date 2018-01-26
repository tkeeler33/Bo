# Bo
Bo the Almighty Slack Bot!

## Getting Started
#### Requirements
- Node.js (LTS)

#### Clone this repo:
```
git clone https://github.com/tkeeler33/Bo.git
```

#### Set your Slack API key
Configure your Slack API key using environment variables:
```
export SLACK_API_TOKEN=[Bot API Token]
```

#### Start the bot!
```
npm start
```

## TODO:
- Auto-join public channels
- Retrieve channel history on join (& track timestamps)
- Fetch messages and parse
- Fetch files (images & videos) and parse
	- Integrate w/Google Photos and/or other sources
- Figure out a best place to store messages. Options:
	- NoSQL DB
	- S3
	- ElasticSearch
- Lots more to do!


