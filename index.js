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

stream.on(ETwitterStreamEvent.Data, data => {
  console.log(data)
  
});

stream.on(ETwitterStreamEvent.Connected, () => console.log('Stream is started.'));

stream.connect({ autoReconnect: true, autoReconnectRetries: Infinity });

