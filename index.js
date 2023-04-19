const { ETwitterStreamEvent, TweetStream, TwitterApi, ETwitterApiError } = require('twitter-api-v2');

const config = require("./config.json");

const client = new TwitterApi(config.bearer_token)

const stream = client.v2.searchStream({ autoConnect: false });

const rules = client.v2.streamRules();

rules.then(function(res){
  var allRules = res.data;

  if(!allRules.find(rule => rule.tag === "CP Detector")) {
    client.v2.updateStreamRules({
      add: [
        { value: 'remove the htt', tag: 'CP Detector' },
        { value: 'remove the invite htt', tag: 'CP Detector 2' },
      ],
    });

    console.log("Added CP Detector rule")
  }
})

stream.on(ETwitterStreamEvent.Data, async data => {

  var tweet = await client.v1.singleTweet(data.data.id);
  var user = tweet.user;

  var data = {
    tweet_id: tweet.id,
    user_id: user.id,
    user_name: user.name,
    full_text: tweet.full_text,
    corrected_link: tweet.full_text.match(/\bhtt[^\s]*/g)[0].replace(/[^a-zA-Z \/:.]*/gm, "")
  }

  console.log(data)
});

stream.on(ETwitterStreamEvent.Connected, () => console.log('Stream is started.'));

stream.connect({ autoReconnect: true, autoReconnectRetries: Infinity });

