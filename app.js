import { updateSolvedProblemList, initializeDb } from './updater.js';
const { App } = require('@slack/bolt');

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.LC_SLACK_BOT_TOKEN,
  signingSecret: process.env.LC_SLACK_SIGNING_SECRET
});

app.message("update", ({ message, say }) => {
  updateSolvedProblemList(app, message.channel);
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3001);
  initializeDb();
  console.log('⚡️ Bolt app is running!');
})();
