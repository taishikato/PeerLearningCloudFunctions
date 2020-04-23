import * as moment from 'moment-timezone'
import getUnixTime from './getUnixTime'
import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
admin.initializeApp(functions.config().firebase)

const db: admin.firestore.Firestore = admin.firestore()

// exports.scheduledStreakSetterCrontab = functions
//   .region('asia-northeast1')
//   .pubsub.schedule('0 0 * * *')
//   .timeZone('Asia/Tokyo') // Users can choose timezone - default is America/Los_Angeles
//   .onRun((context) => {
//     console.log('This will be run every day at 00:00 AM Asia/Tokyo!');
//   })

/**
 * 東京拠点にデプロイします
 * 毎日日本時間深夜0時に実行
 */
exports.scheduledStreakSetterCrontab = functions
  .region('asia-northeast1')
  .pubsub.schedule('0 0 * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async context => {
    console.log('INFO: START');
    // 昨日の日付取得
    const dateObj = new Date()
    dateObj.setDate(dateObj.getDate() - 1)
    const yesterdayDate = moment(dateObj).tz('Asia/Tokyo').format('YYYYMMDD')
    console.log({yesterdayDate})
    // ユーザー取得
    const usersSnapShot = await db.collection('users').get()
    // ユーザー一人ひとりの前日の投稿の有無を確認してsreaksコレクションを更新
    await Promise.all(usersSnapShot.docs.map(async doc => {
      const userId = doc.id
      const postSnapShot = await db.collection('posts').where('userId', '==', userId).where('createdDate', '==', yesterdayDate).get()
      let updateValue = 0
      const streakSnapShot = await db.collection('streaks').where('userId', '==', userId).get()
      if (!postSnapShot.empty) {
        if (!streakSnapShot.empty) {
          const streak = streakSnapShot.docs[0].data()
          updateValue = streak.value += 1
          await db.collection('streaks').doc(streakSnapShot.docs[0].id).update({value: updateValue})
        } else {
          updateValue = 1
          await db.collection('streaks').add({userId, value: updateValue})
        }
      } else {
        // 以下のどちらの場合にしろ0になる
        if (!streakSnapShot.empty) {
          await db.collection('streaks').doc(streakSnapShot.docs[0].id).update({value: updateValue})
        } else {
          await db.collection('streaks').add({userId, value: updateValue})
        }
      }
    }))
    // streakコレクションから上位○名を取得してオブジェクトとして保存
    const streaksSnapShot = await db.collection('streaks').orderBy('value', 'desc').get()
    console.log('ここからStreak！！')
    const newStreakData: {user: any, streak: number}[] = []
    await Promise.all(streaksSnapShot.docs.map(async doc => {
      const streak = doc.data()
      console.log({streak})
      const user = await db.collection('users').doc(streak.userId).get()
      const userData = user.data()
      newStreakData.push({
        user: {
          displayName: userData!.displayName,
          picture: userData!.picture,
          userName: userData!.userName,
        },
        streak:streak.value
      })
    }))
    await db.collection('streakRank').add({
      streakRank: newStreakData,
      created: getUnixTime()
    })
    console.log('INFO: END');
  })