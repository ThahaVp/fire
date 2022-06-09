const cron = require('node-cron')
var admin = require("firebase-admin");
var serviceAccount = require("./delivery-58fd5-firebase-adminsdk-pxhyn-f6c803d34a.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://delivery-58fd5.firebaseio.com"
  });

const job = cron.schedule("1 14 17 * * *", () => {
    
    console.log("working")
    const db = admin.database();
  const ref = db.ref('Area/ponnani/cron');
  ref.set(new Date().toLocaleString()).then(function () {
    console.log("done")
  }).catch(function (error) {
  console.log("error " + error)
});

});

const secondJob = cron.schedule("* * 17 * * *", () => {
    console.log(new Date().toLocaleString())
});

  secondJob.start()
  job.start()
