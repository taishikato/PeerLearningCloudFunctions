import * as functions from 'firebase-functions';

exports.scheduledStreakSetterCrontab = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('Asia/Tokyo') // Users can choose timezone - default is America/Los_Angeles
  .onRun((context) => {
    console.log('This will be run every day at 00:00 AM Asia/Tokyo!');
    return;
  });
