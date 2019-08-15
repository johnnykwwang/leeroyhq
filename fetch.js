const request = require('request');

// function buildMessage(username, probName, probUrl){
//   return [
//       {
//         "type": "section",
//         "text": {
//           "type": "mrkdwn",
//           "text": username + " just solved *" + probName + "* !"
//         }
//       },
//       {
//         "type": "context",
//         "elements": [
//           {
//             "type": "mrkdwn",
//             "text": 'https://www.leetcode.com' + probUrl
//           }
//         ]
//       }
//     ]
//   };

// async function newSolvedProblemToSlack(app, username, probName, probUrl, channelId){
//   try{ 
//     const result = await app.client.chat.postMessage({
//       token: process.env.LC_SLACK_BOT_TOKEN,
//       channel: channelId,
//       blocks: buildMessage(username, probName, probUrl)
//     });
//   }
//   catch( error ){
//     console.log( error );
//   }
// }

function num2diff(difficulty){
  if(difficulty==1) return 'easy';
  if(difficulty==2) return 'medium';
  if(difficulty==3) return 'hard';
  
}

function updateLeetcodeProblemsInDb(username, slackApp, db,  channelId){
  return function handleRequest(error, response, body){
    const jsonObject = JSON.parse(body);
    var dbProblems = db.get('problems');
    jsonObject.stat_status_pairs.each( function(){
      const probName = this.stat.question__title;
      const difficulty = this.stat.difficulty;
      var problemRecord = db.get('problems').find({problemName: probName});
      if( !dbProblems.has(probName).value() ){
        //newProblemInSlack(slackApp, probName, channelId);
        dbProblems.set(probName, num2diff(difficulty));
      }
    } );
  }
}

export async function fetchAllLeetcodeProblems(slackApp, db, channelId ) {
  const url = 'https://leetcode.com/api/problems/algorithms/';
  request(url, updateLeetcodeProblemsInDb(slackApp, db, channelId));
}
