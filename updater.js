const request = require('request');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)
const cheerio = require('cheerio')

function buildMessage(username, probName, probUrl){
  return [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": username + " just solved *" + probName + "* !"
        }
      },
      {
        "type": "context",
        "elements": [
          {
            "type": "mrkdwn",
            "text": 'https://www.leetcode.com' + probUrl
          }
        ]
      }
    ]
  };

async function defaultMessageToSlack(app,channelId){
  try{ 
    const result = await app.client.chat.postMessage({
      token: process.env.LC_SLACK_BOT_TOKEN,
      channel: channelId,
      text: "Updating, I'm a friendly frog..."
    });
  }
  catch( error ){
    console.log( error );
  }
}

async function newSolvedProblemToSlack(app, username, probName, probUrl, channelId){
  try{ 
    const result = await app.client.chat.postMessage({
      token: process.env.LC_SLACK_BOT_TOKEN,
      channel: channelId,
      blocks: buildMessage(username, probName, probUrl)
    });
  }
  catch( error ){
    console.log( error );
  }
}

function updateUser(username, slackApp, channelId){
  return function handleRequest(error, response, body){
    // console.log('body:' + body);
    const $ = cheerio.load(body);
    const recentSubmission = $('ul.list-group > a');
    var userRecord = db.get('trackedUsers').find({username: username});
    recentSubmission.each( function() {
      const status = $(this).find('span').first().text().trim();
      const probName = $(this).find('b').text().trim();
      const probUrl = $(this).attr('href').trim();
      console.log(probName);
      if(status=="Accepted" &&
        !userRecord.has('solved.'+probName).value()
      ){
        newSolvedProblemToSlack(slackApp, userRecord.value().username, probName, probUrl, channelId);
        userRecord.set('solved.'+probName, true).write();
      }
    });
  }
}

export async function initializeDb(){
  db.defaults({ trackedUsers: [] }).write();
}

export async function updateSolvedProblemList(slackApp, channelId ) {
  var trackedUsers = db.get('trackedUsers').value();
  defaultMessageToSlack(slackApp, channelId);
  for ( const user of trackedUsers ){
    console.log(user.username)
    const url = 'https://leetcode.com/' + user.username ; 
    request(url, updateUser(user.username,slackApp, channelId));
  }
}
