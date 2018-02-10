# Bo
Bo the Almighty Slack Bot!

## Getting Started
#### Requirements
- Node.js (LTS)

#### Clone this repo:
```
git clone https://github.com/tkeeler33/Bo.git
```

#### Set your environment variables & API keys
Configure Bo using the following environment variables:
```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=

SLACK_API_TOKEN=
SLACK_ADMIN_CHANNEL=

FLICKR_API_KEY=
FLICKR_API_SECRET=
FLICKR_DEFAULT_ALBUM=
FLICKR_OAUTH_TOKEN=
FLICKR_OAUTH_TOKEN_SECRET=

```
*Note*: AWS keys only needed if deploying with coldbrew

#### Start the bot!
```
npm start
```

## TODO:
- [ ] Update this README.md
- [ ] Add better logging (ie Bunyan)
- [ ] Update the channel & user lists on new users and channels
- [ ] Add native .env support
- [x] Fetch files (images & videos) and parse
	- Integrated with Flickr albums!
- [ ] Add fun stuff!


