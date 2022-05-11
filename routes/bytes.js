var express = require('express');
var router = express.Router();
//var bytesHelper = require('../helpers/bytes-helper');
var pdf = require('html-pdf');
var options = { format: 'A4' };


var admin = require("firebase-admin");

var serviceAccount = require("../delivery-58fd5-firebase-adminsdk-pxhyn-f6c803d34a.json");
const async = require('hbs/lib/async');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://delivery-58fd5.firebaseio.com"
});

router.get('/getExpenses', (req, res) => {

  const db = admin.database();
  const ref = db.ref('Area/ponnani/expenses');

  // Attach an asynchronous callback to read the data at our posts reference
  ref.on('value', (snapshot) => {
    res.json({
      status: 1,
      list: snapshot.val()
    })
  }, (errorObject) => {
    res.json({
      status: 0
    })
  });

})

router.post('/getRestaurants', (req, res) => {

  const db = admin.database();
  const ref = db.ref('res_list');
  var userLat = req.body.lat
  var userLng = req.body.lng

  ref.once('value', (snapshot) => {
    var areaMap = {}
    snapshot.forEach((child) => {
      var resLat = child.val().lat
      var resLng = child.val().lng
      var resLimit = child.val().l
      var resArea = child.val().a
      var resID = child.val().id
      var distance = getDistanceFromLatLonInKm(userLat, userLng, resLat, resLng)

      if (distance <= resLimit) {
        var temp = areaMap[resArea]
        if (temp == null) { temp = [] }

        temp.push(resID)
        areaMap[resArea] = temp

      }
    })



    if (areaMap != null && Object.keys(areaMap).length > 0) {

      // ASYNC AWAIT FETCHING

      let resList = getResFromAreas(areaMap)

      resList.then(function (result) {
        res.json({
          status: 1,
          list: result
        })
      })

    }
    else {

      res.json({
        status: 1,
        msg: "no restaurants",
        list:[]
      })
    }

  }, (errorObject) => {
    res.json({
      status: 1,
      msg: "firebase error " + errorObject,
      list:[]
    })
  });

})


router.post('/acceptOrder', (req, res) => {

  var minutesToAdd = req.body.time;
  var res_id = req.body.res_id
  var area = req.body.area
  var orderKey = req.body.key
  var fcm = req.body.fcm
  var customer = req.body.customer
  var res_order_key = req.body.res_order_key

  // Map<String,Object> map = new HashMap<>();
  // map.put("key", key);
  // map.put("accepted", "");
  // reference.child("Area").child(area).child("shop_order").child(Rest_id).child(res_key).updateChildren(map);

  // currently doing this to stop sound in restaurant

  if (minutesToAdd == null) {
    minutesToAdd = 30
  }

  var currentDate = new Date();
  var date_ob = new Date(currentDate.getTime() + minutesToAdd * 60000);

  var hours = date_ob.getHours();
  var minutes = date_ob.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var time = hours + ':' + minutes + ' ' + ampm;


  if (area != null && orderKey != null && res_id != null) {
    const db = admin.database();
    const ref = db.ref('testing/' + orderKey + '/status');
    // const ref = db.ref('Area/' + area + '/testing/' + orderKey + '/status');

    ref.once('value', (snapshot) => {
      if (snapshot.val() != null) {
        var orderStatus = snapshot.val().split(',')
        if (orderStatus[0] != 0) {
          var message = {
            notification: {
              title: "Order Accepted",
              body: "Hi " + customer + ", Your order is has accepted and will be delivered as soon its ready !"
            },
            android: {
              notification: {
                channel_id: "Order Accepted"
              }
            },
            token: fcm
          }

          ref.set("1," + time).then(function () {
            console.log('Upload succeeded');

            res.json({
              status: 1
            })

            // admin.messaging().send(message)
            sendOrderToRider(orderKey, area)

          }).catch(function (error) {
            console.log('Upload failed ' + error);
          });

        }
        else {
          res.json({
            status: 0
          })
        }
      }
      else {
        res.json({
          status: 0
        })
      }

    }, (errorObject) => {
    });
  }
  else {
    res.json({
      status: 0
    })
  }


})


router.post('/sendNotification', (req, res) => {
  let topic = req.body.topic
  let title = req.body.title
  let des = req.body.des

  var message = {
    notification: {
      title: title,
      body: des
    },
    topic: topic
  };

  admin.messaging().send(message)
    .then((response) => {
      res.json({
        status: 1
      })
    })
    .catch((error) => {
      res.json({
        status: 1,
        msg: error
      })
    });

})


router.post('/generateInvoice', (req, res) => {

  let ts = Date.now();
  let date_ob = new Date(ts);
  let month = date_ob.getMonth() + 1
  let time = date_ob.getHours() + ":" + date_ob.getMinutes() + ":" + date_ob.getSeconds()
  let dateF = date_ob.getFullYear() + "-" + month + "-" + date_ob.getDate()
  let dateDisplay = date_ob.getDate() + "-" + month + "-" + date_ob.getFullYear()
  req.body.dt = dateF
  req.body.ti = time

  var html = "<!DOCTYPE html> <html lang='en'> <head> <meta charset='UTF-8'> <meta http-equiv='X-UA-Compatible' content='IE=edge'> <meta name='viewport' content='width=device-width, initial-scale=1.0'> <title>Order Tax Invoice</title> </head> <style> body { font-family: 'Open Sans', sans-serif; } .text { font-size: 10px; line-height: 1.5; } td { padding: 3px; margin: 0; } h3, p { margin: 0; font-size: 10px; } .tt, .tt td, .tt th { border: 1px solid; text-align: center; } .tt { width: 100%; margin-top: 30px; } table { border-collapse: collapse; } </style> <body> <div style='width: 95%; margin-left: auto;margin-right: auto;'> <img style='width: 100px;' src='https://lh3.googleusercontent.com/p/AF1QipOxdwx9QazNoSMYsqfnD8SIfElufbjiWbMncNMX=w768-h768-n-o-v1'/> <h3 style='text-align: center;'>Tax Invoice</h3> <p class='text' style='text-align: center;'>ORIGINAL For Recipient</p> <table style='margin-top: 20px;'> <tr> <td><h3>Invoice Number</h3></td> <td><p class='text'>:</p></td> <td><p class='text'>00767</p></td> </tr> <tr> <td><h3>Invoice Date</h3></td><td><p class='text'>:</p></td> <td><p class='text'>"
    + dateDisplay +
    "</p></td> </tr> <tr> <td><h3>Order ID</h3></td> <td><p class='text'>:</p></td> <td><p class='text'>-MzAsydqXZA1PKI_tkI7</p></td> </tr> <tr> <td><h3>Restaurant Name</h3></td> <td><p class='text'>:</p></td> <td><p class='text'>Harbour Heritage</p></td> </tr> <tr> <td></td> <td></td> </tr> <tr> <td><h3>Customer Name</h3></td> <td><p class='text'>:</p></td> <td><p class='text'>Ahmed Kais</p></td> </tr> <tr> <td><h3>Delivery Address</h3></td> <td><p class='text'>:</p></td> <td><p class='text'>Pulikka Kadavu Road</p></td> </tr> </table> <table class='tt'> <tr> <td><h3>Items</h3></td> <td><h3>Gross Value</h3></td> <td><h3>Discount</h3></td> <td><h3>Net Value</h3></td> <td><h3>CGST</h3></td> <td><h3>SGST</h3></td> <td><h3>Total</h3></td> </tr> <tr> <td><p class='text'>1 X Chicken 65 Full<br>2X Beef Chilly<br>8 Poratta</p></td> <td><p class='text'>720</p></td> <td><p class='text'>0</p></td> <td><p class='text'>720</p></td> <td><p class='text'>18</p></td> <td><p class='text'>18</p></td> <td><p class='text'>756</p></td> </tr> <tr> <td><h3>Total Value</h3></td> <td></td> <td></td> <td><p class='text'>720</p></td> <td><p class='text'>18</p></td> <td><p class='text'>18</p></td> <td><p class='text'>756</p></td> </tr> </table> <table style='margin-top: 20px;'> <tr> <td><h3>Amount (in words)</h3></td> <td><p class='text'>:</p></td> <td><p class='text'> Seven Hundred Fifty Six Only</p></td> </tr> </table> <h3 style='margin-top: 20px;'>BYTES DELIVERY LLP</h3> <p class='text'>Bytes GST : 32AAYFB5863C1ZB</p> </div> </body> </html>"

  // var html = "<!DOCTYPE html> <html lang='en'> <head> <meta charset='UTF-8'> <meta http-equiv='X-UA-Compatible' content='IE=edge'> <meta name='viewport' content='width=device-width, initial-scale=1.0'> <title>Order Tax Invoice</title> </head> <style> body { font-family: 'Open Sans', sans-serif; } .text { font-size: 10px; line-height: 1.5; } td { padding: 3px; margin: 0; } h3, p { margin: 0; font-size: 10px; } .tt, .tt td, .tt th { border: 1px solid; text-align: center; } .tt { width: 100%; margin-top: 30px; } table { border-collapse: collapse; } </style> <body> <div style='width: 95%; margin-left: auto;margin-right: auto;'> <img style='width: 100px;' src='https://lh3.googleusercontent.com/p/AF1QipOxdwx9QazNoSMYsqfnD8SIfElufbjiWbMncNMX=w768-h768-n-o-v1'/> <h3 style='text-align: center;'>Tax Invoice</h3> <p class='text' style='text-align: center;'>ORIGINAL For Recipient</p> <table style='margin-top: 20px;'> <tr> <td><h3>Invoice Number</h3></td> <td><p class='text'>:</p></td> <td><p class='text'>165</p></td> </tr> <tr> <td><h3>Invoice Date</h3></td><td><p class='text'>:</p></td> <td><p class='text'>"
  // + dateDisplay +
  // "</p></td> </tr> <tr> <td><h3>Order ID</h3></td> <td><p class='text'>:</p></td> <td><p class='text'>"
  // + req.body.oid +"</p></td> </tr> <tr> <td><h3>Restaurant Name</h3></td> <td><p class='text'>:</p></td> <td><p class='text'>"
  // + req.body.res_title + "</p></td> </tr> <tr> <td></td> <td></td> </tr> <tr> <td><h3>Customer Name</h3></td> <td><p class='text'>:</p></td> <td><p class='text'>"
  // + req.body.customer_name + "</p></td> </tr> <tr> <td><h3>Delivery Address</h3></td> <td><p class='text'>:</p></td> <td><p class='text'>"
  // + req.body.customer_address + "</p></td> </tr> </table> <table class='tt'> <tr> <td><h3>Items</h3></td> <td><h3>Gross Value</h3></td> <td><h3>Discount</h3></td> <td><h3>Net Value</h3></td> <td><h3>CGST</h3></td> <td><h3>SGST</h3></td> <td><h3>Total</h3></td> </tr> <tr> <td><p class='text'>2 X Chicken Chilly<br>2X Poratta</p></td> <td><p class='text'>780</p></td> <td><p class='text'>0</p></td> <td><p class='text'>780</p></td> <td><p class='text'>19.5</p></td> <td><p class='text'>19.5</p></td> <td><p class='text'>819</p></td> </tr> <tr> <td><h3>Total Value</h3></td> <td></td> <td></td> <td><p class='text'>780</p></td> <td><p class='text'>19.5</p></td> <td><p class='text'>19.5</p></td> <td><p class='text'>819</p></td> </tr> </table> <table style='margin-top: 20px;'> <tr> <td><h3>Amount (in words)</h3></td> <td><p class='text'>:</p></td> <td><p class='text'>"
  // + inWords(43) + "</p></td> </tr> </table> <h3 style='margin-top: 20px;'>BYTES DELIVERY LLP</h3> <p class='text' style='margin-top: 5px;'>Bytes PAN : </p> <p class='text'>Bytes GST : </p> </div> </body> </html>"

  pdf.create(html, options).toFile('./public/customer_invoice/invoice.pdf', function (err, pdfRes) {
    if (err) return console.log("error" + err);
    console.log(pdfRes);
    res.json({
      status: 1,
      path: "./public/customer_invoice/invoice.pdf"
    })
  });

  // bytesHelper.addInvoice(req.body).then((responce) =>
  // {
  //   if (responce)
  //   {
  //     console.log(responce)
  //     res.json({
  //       status: 1,
  //       id: responce.toString()
  //     })
  //   }
  //   else
  //   {
  //     res.json({
  //       status: 0,
  //       id: ""
  //     })
  //   }
  // })
})


module.exports = router;

function sendOrderToRider(key, area) {

  const db = admin.database();
  const ref = db.ref('Area/' + area + '/riders');

  ref.once('value', (snapshot) => {
    if (snapshot.val() != null) {
      var riderMap = {}
      snapshot.forEach((child) => {
        if (child.val().status == 1) {
          if (child.hasChild("pending")) {
            riderMap[child.key] = Object.keys(child.val().pending).length
          }
          else {
            riderMap[child.key] = 0
          }
        }

      })
      console.log(riderMap)
    }
  }, (errorObject) => {
  });

}


var a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
var b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function inWords(num) {

  // check if decimal or not
  // get decimal part and call function again and merge return string

  if ((num = num.toString()).length > 9) return 'overflow';
  n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return; var str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'only ' : '';
  return str;
}


function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1);  // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180)
}

async function getResFromAreas(areaMap) {

  var resList = []
  for (const each in areaMap) {

    var tempArray = areaMap[each]
    const rrr = admin.database().ref('Area/' + each + '/shop')
    await rrr.once('value', (snapshot) => {
      snapshot.forEach((child) => {
        if (tempArray.includes(child.val().c))
        {
          resList.push(child.val())
        }        
        
      })



    }, (errorObject) => {
      // return error
    });
  }
  return resList
}
