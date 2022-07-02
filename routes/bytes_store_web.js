var express = require('express');
var router = express.Router();

var admin = require("firebase-admin");

var serviceAccount = require("../delivery-58fd5-firebase-adminsdk-pxhyn-f6c803d34a.json");
const { ObjectId } = require('mongodb');

if (!admin.apps.length) {
  const firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://delivery-58fd5.firebaseio.com"
  });
}

router.get("/:area/:rid", (req,res)=>{
  const db = admin.database();
  const ref = db.ref('Area/'+req.params.area+'/shop/'+req.params.rid);

  ref.once('value', (snapshot) => {
    if (snapshot.val() != null)
    {
      var obj = snapshot.val()
      obj.area = req.params.area
      res.render('bytes-store/dashboard-home', {data: obj});
    }
    else
    {
      res.status(404).send('page not found')
    }
  }, (errorObject) => {

  });
})

router.get("/dashboard", (req,res)=>{
  res.render('admin/dashboard-home', {admin:true,});
})

router.get("/settings", (req,res)=>{
  res.render('admin/settings', {admin:true,});
})

router.get("/orders", (req,res)=>{
  res.render('admin/orders', {admin:true,});
})

router.get("/menu", (req,res)=>{
  res.render('admin/menu-tab', {admin:true,});
})

router.get("/setup-store", (req,res)=>{
  res.render('admin/setup-store', {admin:true,});
})


module.exports = router;
