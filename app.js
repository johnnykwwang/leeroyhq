import { updateSolvedProblemList, initializeDb } from './updater.js';
import { fetchAllLeetcodeProblems } from './fetch.js';
const { App } = require('@slack/bolt');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)
const cheerio = require('cheerio')

function initializeDb(){
  db.defaults({ trackedUsers: [] }).write();
}

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.LC_SLACK_BOT_TOKEN,
  signingSecret: process.env.LC_SLACK_SIGNING_SECRET
});

app.message(/^update$/, ({ message, say }) => {
  updateSolvedProblemList(app, db, message.channel);
});

app.message(/^fetch$/, ({ message, say }) => {
  fetchAllLeetcodeProblems(app, db, message.channel);
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3001);
  initializeDb();
  console.log('⚡️ Bolt app is running!');
})();
