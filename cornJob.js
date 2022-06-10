const cron = require('node-cron')
var admin = require("firebase-admin");
var serviceAccount = require("./delivery-58fd5-firebase-adminsdk-pxhyn-f6c803d34a.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://delivery-58fd5.firebaseio.com"
});

let arr = [
  {
    ref: "food feast",
    area: "ponnani",
    hour: 15,
    minute: 1
  },
  {
    ref: "harbour heritage",
    area: "ponnani",
    hour: 12,
    minute: 30
  },
  {
    ref: "ikkayis kuzhimandhi",
    area: "ponnani",
    hour: 11,
    minute: 1
  },
  {
    ref: "jawas restaurant",
    area: "ponnani",
    hour: 16,
    minute: 1
  },
  {
    ref: "juicy",
    area: "ponnani",
    hour: 12,
    minute: 1
  },
  {
    ref: "modern foods",
    area: "ponnani",
    hour: 11,
    minute: 30
  },
  {
    ref: "scoopso",
    area: "ponnani",
    hour: 11,
    minute: 1
  },
]


const job = cron.schedule("1 1,30 11,12,15,16 * * *", () => {

  let ts = Date.now();
  let date_ob = new Date(ts);
  let minutes = date_ob.getMinutes()
  let hour = date_ob.getHours()

  const db = admin.database();
  for (var i = 0; i < arr.length; i++)
  {
    let obj = arr[i]
    if (hour == obj.hour && minutes == obj.minute) {
      const ref = db.ref('Area/' + obj.area + '/shop/' + obj.ref + '/status');
      ref.set("open").then(function () {
        console.log("done")
      }).catch(function (error) {
        console.log("error " + error)
      });
    }
  }

});
job.start()
