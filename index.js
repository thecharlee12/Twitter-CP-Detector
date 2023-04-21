const { ETwitterStreamEvent, TweetStream, TwitterApi, ETwitterApiError } = require('twitter-api-v2');

const config = require("./config.json");

const client = new TwitterApi(config.bearer_token);

const stream = client.v2.searchStream({ autoConnect: false });

const rules = client.v2.streamRules();

rules.then(async function(res){
  var allRules = res.data;

  if(allRules) {
    var allRulesIds = allRules.map(rule => rule.id)
    await client.v2.updateStreamRules({
      delete: { ids: allRulesIds }
    }) 

    allRules = false;
  }

  if(!allRules || !allRules.find(rule => rule.tag === "CP Detector 5")) {
    client.v2.updateStreamRules({
      add: [
        { value: 'remove the htt', tag: 'CP Detector' },
        { value: 'remove the invite htt', tag: 'CP Detector 2' },
        { value: 'without the invite htt', tag: 'CP Detector 3' },
        { value: 'remove for invite htt', tag: 'CP Detector 4' },
        { value: 'htt i= remove', tag: 'CP Detector 5' },
      ],
    });

    console.log("Added CP Detector rule")
  }
})

stream.on(ETwitterStreamEvent.Data, async data => {

  var tweet = await client.v1.singleTweet(data.data.id);
  var user = tweet.user;

  let correctlink = tweet.full_text.match(/\bhtt[^\s]*/g);
  if(!correctlink) correctlink = "No link found";
  correctlink = correctlink[0].replace(/[^a-zA-Z\/:.]*/gm, "");


  var data = {
    tweet_id: tweet.id,
    user_id: user.id_str,
    user_name: user.screen_name,
    full_text: tweet.full_text,
    corrected_link: correctlink,
    pot_false_positive: !isValidUrl(correctlink)
  }
  
  console.log(data)

});

stream.on(ETwitterStreamEvent.Connected, () => console.log('Stream is started.'));

stream.connect({ autoReconnect: true, autoReconnectRetries: Infinity });

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (err) {
    return false;
  }
}