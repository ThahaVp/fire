var express = require('express');
var router = express.Router();
var bytesHelper = require('../helpers/bytes-helper');


var admin = require("firebase-admin");

var serviceAccount = require("../delivery-58fd5-firebase-adminsdk-pxhyn-f6c803d34a.json");
const async = require('hbs/lib/async');
const { ObjectId } = require('mongodb');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://delivery-58fd5.firebaseio.com"
});

router.post('/removePendingOrder', (req, res) => {

  let oid = req.body.oid
  let rid = req.body.rid
  let area = req.body.area

  const db = admin.database();
  const ref = db.ref('Area/'+area+'/riders/'+rid+'/pending/'+oid);
  ref.set(null)

})

router.post('/acceptOrder', (req, res) => {

  let oid = req.body.oid
  let rid = req.body.rid
  let area = req.body.area

  const db = admin.database();
  const ref = db.ref('Area/'+area+'/riders/'+rid+'/pending/'+oid);
  ref.set(1)

})

