var express = require('express');
const axios = require('axios');
var router = express.Router();
var bytesHelper = require('../helpers/bytes-helper');
var pdf = require('html-pdf');
var options = { format: 'A4' };
var razorpay = require('razorpay')


var admin = require("firebase-admin");

var serviceAccount = require("../delivery-58fd5-firebase-adminsdk-pxhyn-f6c803d34a.json");
const async = require('hbs/lib/async');
const { ObjectId } = require('mongodb');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://delivery-58fd5.firebaseio.com"
});

const RKeyId = "rzp_live_zDcGNQ4ExDMwba"
const RKetSecret = "GDrrlPrC4XijhpVQJXg963S9"

const instance = new razorpay({
  key_id: RKeyId,
  key_secret: RKetSecret
})

router.get('/getExpenses', (req, res) => {

  const db = admin.database();
  const ref = db.ref('Area/ponnani/shop');

  // Attach an asynchronous callback to read the data at our posts reference
  ref.on('value', (snapshot) => {
    var map = []
    snapshot.forEach((child) => {

      if (!child.hasChild("i")) {
        console.log(child.key)
      }

      // let obj = {
      //   a: "edappal",
      //   id: child.key,
      //   l: child.val().l,
      //   lat: child.val().lat,
      //   lng: child.val().lng
      // }
      // map.push(obj)
    })

    // for (var i=0;i<map.length;i++)
    // {
    //   const listRef = db.ref('res_list').push();
    //   listRef.set(map[i])
    // }

  }, (errorObject) => {

  });

})

router.get('/testing', (req, res) => {

  const db = admin.database();
  const ref = db.ref('Area/edappal/products/cafe di kebabista');

  ref.on('value', (snapshot) => {

    var map = {}

    var obj = snapshot.val()
    var keys = Object.keys(obj)


    for (var i = 0; i < keys.length; i++) {

      var k = keys[i]
      // k = k.replace(/\s+/g,'%20');
      map[keys[i] + "/i"] = k + ".webp"
    }

    res.json({
      status: 1,
      list: map
    })
    ref.update(map)




  }, (errorObject) => {
    console.log("Error " + errorObject)

  })

})

router.get('/refFix', (req, res) => {

  const db = admin.database();
  const ref = db.ref('Area/ponnani/shop_order/jawas restaurant');

  ref.on('value', (snapshot) => {

    var map = {}

    var obj = snapshot.val()
    var keys = Object.keys(obj)


    for (var i = 0; i < keys.length; i++) {

      var k = keys[i]
      // if (obj)
      // map[keys[i]+"/i"] = k+".webp"

    }

  }, (errorObject) => {
    console.log("Error " + errorObject)

  })

})

// Incomplete
router.get('/findNoImages', (req, res) => {

  const db = admin.database();
  const ref = db.ref('Area/ponnani/products/albaik');

  ref.on('value', (snapshot) => {


    var obj = snapshot.val()
    let mm = getNilImages(obj)
    mm.then(function (result) {
      res.json({
        status: 1,
        map: result
      })
    })


  }, (errorObject) => {
    console.log("Error " + errorObject)

  })

})

router.post('/getFoods', (req, res) => {

  var resID = req.body.id
  var area = req.body.area

  const db = admin.database();
  const ref = db.ref('Area/' + area + "/products/" + resID);
  const resRef = db.ref('Area/' + area + "/shop/" + resID + "/status");



  ref.once('value', (snapshot) => {

    var list = []
    snapshot.forEach((child) => {
      var show = child.val().sh
      if (show == 1) {
        var obj = child.val()
        obj.qty = 0
        obj.key = child.key
        list.push(obj)
      }
    })

    if (list.length > 0) {

      resRef.once('value', (snapshot) => {
        if (snapshot.val() == 'open') {
          res.json({
            status: 1,
            list: list,
            res_status: 1
          })
        }
        else {
          res.json({
            status: 1,
            list: list,
            res_status: 0
          })
        }
      }, (errorObject) => {
        res.json({
          status: 1,
          list: list,
          res_status: 0
        })
      });


    }
    else {
      res.json({
        status: 0,
        list: [],
        msg: "empty",
        res_status: 0
      })
    }

  }, (errorObject) => {
    res.json({
      status: 0,
      msg: "firebase error " + errorObject,
      list: [],
      res_status: 0
    })
  });
})

router.post('/getExtraInCart', (req, res) => {

  var resID = req.body.id
  var area = req.body.area
  var foods = req.body.foods.split(",")

  const db = admin.database();
  const ref = db.ref('Area/' + area + "/products/" + resID);

  ref.once('value', (snapshot) => {

    var list = []
    snapshot.forEach((child) => {
      if (foods.includes(child.key)) {
        var obj =
        {
          p: child.val().p,
          po: child.val().po,
          a: child.val().a,
          id: child.key
        }
        list.push(obj)
      }

    })

    if (list.length > 0) {
      const shopRef = db.ref('Area/' + area + "/shop/" + resID);
      shopRef.once('value', (childshot) => {

        let rStatus = 0
        let rain = 0
        let mainSwitch = childshot.val().status

        if (childshot.hasChild("rain")) {
          let rainObj = childshot.val().rain

          if (rainObj.ra == 1) { rain = rainObj.rc }
          else { rain = 0 }
        }
        else { rain = 0 }


        if (mainSwitch == "open") {
          // check time here
          rStatus = 1
        }
        else { rStatus = 0 }


        res.json({
          status: 1,
          foods: list,
          res_status: rStatus,
          rain_charge: rain
        })


      }, (errorObject) => {
        res.json({
          status: 0,
          foods: [],
          res_status: 0,
          rain_charge: 0
        })
      });

    }
    else {
      res.json({
        status: 0,
        foods: [],
        res_status: 0,
        rain_charge: 0
      })
    }


  }, (errorObject) => {
    res.json({
      status: 0,
      foods: [],
      res_status: 0,
      rain_charge: 0
    })
  });
})

router.post('/getRestaurants', (req, res) => {

  const db = admin.database();
  const ref = db.ref('res_list');
  var userLat = req.body.lat
  var userLng = req.body.lng
  var areaMap = {}
  let min_ch = 20

  ref.once('value', (snapshot) => {

    snapshot.forEach((child) => {
      var resLat = child.val().lat
      var resLng = child.val().lng
      var resLimit = child.val().l
      var resArea = child.val().a
      var resID = child.val().id
      var distance = getDistanceFromLatLonInKm(userLat, userLng, resLat, resLng)

      if (distance <= resLimit) {
        var temp = areaMap[resArea]
        if (temp == null) { temp = {} }

        temp[resID] = distance
        areaMap[resArea] = temp

      }
    })

    if (areaMap != null && Object.keys(areaMap).length > 0) {

      // ASYNC AWAIT FETCHING

      let mm = getResFromAreas(areaMap)

      mm.then(function (result) {

        res.json({
          status: 1,
          oData: {
            res_in_city: result.res,
            slider: result.imgs,
            min_ch: min_ch,
            latest_vs: 1.1
          }
        })
      })

    }
    else {

      res.json({
        status: 0,
        oData: {
          res_in_city: [],
          slider: [],
          min_ch: min_ch,
          latest_vs: 0
        }
      })
    }

  }, (errorObject) => {
    res.json({
      status: 0,
      oData: {
        res_in_city: [],
        slider: [],
        min_ch: min_ch,
        latest_vs: 0
      }
    })
  });

})

/// RESTAURANT FUNCTIONS /////

router.post('/acceptOrder', (req, res) => {

  var minutesToAdd = req.body.time;
  var res_id = req.body.res_id
  var area = req.body.area
  var orderKey = req.body.key
  var fcm = req.body.fcm
  var customer = req.body.customer
  var res_order_key = req.body.res_order_key

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
    const ref = db.ref('Area/' + area + '/orders/' + orderKey + '/status');

    ref.once('value', (snapshot) => {
      if (snapshot.val() != null) {

        var orderStatus = snapshot.val().split(',')
        if (orderStatus[0] == '0') {

          res.json({
            status: 1,
            string: ""
          })
          const resRef = db.ref('Area/' + area + '/shop_order/' + res_id + '/' + res_order_key);
          let resMap = {
            key: orderKey,
            accepted: ""
          }
          ref.set("1," + time)
          resRef.set(resMap)

          if (fcm != "") {
            var message = {
              notification: {
                title: "Order Accepted",
                body: "Hi " + customer + ", Your order has accepted and will be delivered as soon its ready !"
              },
              android: {
                notification: {
                  channel_id: "Order Accepted"
                }
              },
              token: fcm
            }

            admin.messaging().send(message).catch(function (error) {
              console.log("notification error : " + error)
            })
          }
        }
        else {
          res.json({
            status: 0,
            msg: "order cancelled"
          })
        }
      }
      else {
        res.json({
          status: 0,
          msg: "snapshot is null"
        })
      }

    }, (errorObject) => {
      res.json({
        status: 0,
        msg: "no data found in db " + errorObject.message
      })
    });
  }
  else {
    res.json({
      status: 0,
      msg: "params is null"
    })
  }


})

router.post('/muteOrder', (req, res) => {

  let area = req.body.area
  let rid = req.body.rid

  const db = admin.database();
  const ref = db.ref('Area/' + area + '/shop_order/' + rid).push();
  let obj = {
    key: "abc",
    mute: 1,
    accepted: ""
  }
  ref.set(obj).then(function () {
    res.json({
      status: 1
    })
  })


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

router.post('/sendOtp', (req, resp) => {

  let phone = req.body.phone
  let apiKey = "7185fab5-db6e-11ec-9c12-0200cd936042"

  if (phone == '1234567890') {
    resp.json({
      status: 1,
      string: "temp"
    })
  }
  else {
    axios.get('https://2factor.in/API/V1/' + apiKey + '/SMS/+91' + phone + '/AUTOGEN/Bytes App Otp Template')

      // Show response data
      .then(res => {
        if (res.data.Status == "Success") {
          resp.json({
            status: 1,
            string: res.data.Details
          })
        }
        else {
          resp.json({
            status: 0,
            string: ""
          })
        }
      })
      .catch(err => {
        resp.json({
          status: 0,
          msg: err,
          string: ""
        })
      })
  }

})

router.post('/verifyOtp', (req, resp) => {

  let phone = req.body.phone
  let otp = req.body.otp
  let id = req.body.id
  let apiKey = "7185fab5-db6e-11ec-9c12-0200cd936042"
  let dev_id = req.body.device_id
  let type = parseInt(req.body.type)
  let fcm = req.body.fcm
  let ti = "time"

  if (phone == "1234567890" && otp == "000000") {
    bytesHelper.getUserWithNumber(phone, dev_id, type, fcm, ti).then((responce => {
      if (responce != null) {
        resp.json({
          status: 1,
          user_status: 1,
          user_data: responce
        })
      }
      else {
        resp.json({
          status: 1,
          user_status: 0,
          user_data: {
            _id: "",
            n: "",
            e: "",
            id: "",
            s: ""
          }
        })
      }
    }))
  }
  else {
    axios.get('https://2factor.in/API/V1/' + apiKey + '/SMS/VERIFY/' + id + '/' + otp)

      .then(res => {
        if (res.data.Status == "Success") {

          bytesHelper.getUserWithNumber(phone, dev_id, type, fcm, ti).then((responce => {
            if (responce != null) {
              resp.json({
                status: 1,
                user_status: 1,
                user_data: responce
              })
            }
            else {
              resp.json({
                status: 1,
                user_status: 0,
                user_data: {
                  _id: "",
                  n: "",
                  e: "",
                  id: "",
                  s: ""
                }
              })
            }
          }))

        }
        else {
          resp.json({
            status: 2,
            user_status: 0,
            user_data: {
              _id: "",
              n: "",
              e: "",
              id: "",
              s: ""
            },
            msg: res.data.Status
          })
        }
      })
      .catch(err => {
        resp.json({
          status: 2,
          msg: err,
          user_status: 0,
          user_data: {
            _id: "",
            n: "",
            e: "",
            id: "",
            s: ""
          }
        })
      })
  }



})

router.post('/addUser', (req, res) => {

  let phone = req.body.id
  let email = req.body.e
  let name = req.body.n
  let surname = req.body.s
  let type = parseInt(req.body.t)
  let device_id = req.body.d
  let fcm = req.body.f

  let ts = Date.now();
  let date_ob = new Date(ts);
  let month = date_ob.getMonth() + 1

  let monthString = ""
  if (month < 10) { monthString = "0" + month }
  else { monthString = month.toString() }

  let dayString = ""
  if (date_ob.getDate() < 10) { dayString = "0" + date_ob.getDate() }
  else { dayString = date_ob.getDate().toString() }

  let hourString = ""
  if (date_ob.getHours() < 10) { hourString = "0" + date_ob.getHours() }
  else { hourString = date_ob.getHours().toString() }

  let minuteString = ""
  if (date_ob.getMinutes() < 10) { minuteString = "0" + date_ob.getMinutes() }
  else { minuteString = date_ob.getMinutes().toString() }

  let secondString = ""
  if (date_ob.getSeconds() < 10) { secondString = "0" + date_ob.getSeconds() }
  else { secondString = date_ob.getSeconds().toString() }

  let timeF = hourString + ":" + minuteString + ":" + secondString
  let dateF = dayString + "-" + monthString + "-" + date_ob.getFullYear() + "," + timeF

  let data =
  {
    id: phone,
    e: email,
    n: name,
    s: surname,
    t: type,
    d: device_id,
    f: fcm,
    c: dateF,
    l: dateF
  }

  bytesHelper.addUser(data).then((responce => {
    if (responce != null) {
      res.json({
        status: 1,
        string: responce
      })
    }
    else {
      res.json({
        status: 0,
        string: ""
      })
    }
  }))


})

router.post('/updateUser', (req, res) => {

  let uid = req.body.id
  let email = req.body.email
  let name = req.body.name
  let surname = req.body.surname


  bytesHelper.updateUser(uid, email, name, surname).then((responce => {
    if (responce != null && responce.modifiedCount == 1) {
      res.json({
        status: 1,
        string: ""
      })
    }
    else {
      res.json({
        status: 0,
        string: ""
      })
    }
  }))


})

router.post('/getDeliveryAddress', (req, res) => {

  let uid = req.body.uid
  bytesHelper.getDeliveryAddress(uid).then((responce => {
    if (responce != null) {
      res.json({
        status: 1,
        list: responce
      })
    }
    else {
      res.json({
        status: 0,
        list: []
      })
    }
  }))


})


router.post('/deleteDeliveryAddress', (req, res) => {

  let uid = req.body.uid
  let did = req.body.aid

  bytesHelper.deleteDeliveryAddress(uid, did).then((responce => {
    if (responce != null) {
      res.json({
        status: 1,
        res: responce,
        string: ""
      })
    }
    else {
      res.json({
        status: 0,
        string: ""
      })
    }
  }))


})

router.post('/addDeliveryAddress', (req, res) => {


  let aid = req.body.id
  let uid = req.body.uid
  let data =
  {
    id: aid,
    t: req.body.t,
    a: req.body.a,
    ty: parseInt(req.body.ty),
    s: req.body.s,
    n: req.body.n,
    f: parseInt(req.body.f),
    b: req.body.b,
    ad: req.body.ad,
    p: req.body.p,
    se: req.body.se,
    la: req.body.la,
    ln: req.body.ln
  }


  var keys = Object.keys(data)
  for (var i = 0; i < keys.length; i++) {
    if (data[keys[i]] == null) {
      data[keys[i]] = ""
    }
  }



  if (aid != "") {
    bytesHelper.updateAddress(data, uid).then((responce => {
      if (responce != null) {
        res.json({
          status: 1,
          string: ""
        })
      }
      else {
        res.json({
          status: 0,
          string: ""
        })
      }
    }))
  }
  else {
    var newAid = new Date().valueOf().toString()
    data.id = newAid

    bytesHelper.addDeliveryAddress(data, uid).then((responce => {
      if (responce != null) {
        res.json({
          status: 1,
          string: newAid
        })
      }
      else {
        res.json({
          status: 0,
          string: ""
        })
      }
    }))

  }

})

router.post('/makeOrder', (req, res) => {


  let aid = req.body.aid
  let uid = req.body.uid
  let rid = req.body.rid
  let area = req.body.area
  let pm = parseInt(req.body.pm)
  let notes = req.body.notes
  let order = req.body.order
  let duration = parseInt(req.body.dur)

  let rainCharge = parseInt(req.body.rc)
  let packingCharge = parseFloat(req.body.pc)
  let totalTax = parseFloat(req.body.tax)
  let dc = parseFloat(req.body.dc)
  let name = req.body.name
  let fcm = req.body.fcm
  let resTitle = req.body.res_title
  let resPhone = req.body.res_phone
  let dis = parseFloat(req.body.dis)

  var error = 0

  let ts = Date.now();
  let date_ob = new Date(ts);
  let month = date_ob.getMonth() + 1
  var am = ""

  let monthString = ""
  if (month < 10) { monthString = "0" + month }
  else { monthString = month.toString() }

  let dayString = ""
  if (date_ob.getDate() < 10) { dayString = "0" + date_ob.getDate() }
  else { dayString = date_ob.getDate().toString() }


  if (date_ob.getHours() >= 12) {
    let hh = date_ob.getHours() - 12
    am = "pm"
    if (hh < 10) { hourString = "0" + hh.toString() }
    else { hourString = hh.toString() }
  }
  else {
    am = "am"
    if (date_ob.getHours() < 10) { hourString = "0" + date_ob.getHours() }
    else { hourString = date_ob.getHours().toString() }
  }

  let minuteString = ""
  if (date_ob.getMinutes() < 10) { minuteString = "0" + date_ob.getMinutes() }
  else { minuteString = date_ob.getMinutes().toString() }

  let timeF = hourString + ":" + minuteString + " " + am
  let dateF = dayString + "-" + monthString + "-" + date_ob.getFullYear()

  var subTotal = 0

  if (order != "") {
    let foodArray = []
    try { foodArray = JSON.parse(order) } catch (e) {
      error = 1
      console.log("error " + e)
      res.json({
        status: 0,
        msg: "order parsing error"
      })
    }

    if (error == 0) {
      let keys = foodArray.map(a => a.key);
      const db = admin.database();
      const ref = db.ref('Area/' + area + '/products/' + rid);


      ref.on('value', (snapshot) => {

        var foodListDb = []

        snapshot.forEach((child) => {

          if (keys.includes(child.key)) {
            let obj = child.val()
            let inde = keys.indexOf(child.key)
            obj.qty = foodArray[inde].qty
            obj.subid = foodArray[inde].subid
            obj.key = foodArray[inde].key
            foodListDb.push(obj)
          }
        })

        if (foodListDb.length > 0) {

          var itemTotal = 0
          var finalArray = []
          for (var j = 0; j < foodListDb.length; j++) {

            let po = foodListDb[j]['po']
            let subid = foodListDb[j]['subid']
            let qt = foodListDb[j]['qty']
            let Id = foodListDb[j]['key']
            let pr = 0
            let extra = ""

            if (po != "" && subid.includes(",")) {
              let poArray = {}

              try { poArray = JSON.parse(po) } catch (e) { error = 1 }

              let split = subid.split(",")[1]
              extra = split
              pr = poArray[split].split(",")[0]


            }
            else {
              pr = foodListDb[j]['p']
            }

            let to = pr * qt
            itemTotal += to


            let ob = {
              Title: foodListDb[j]['t'],
              Price: pr,
              Extra: extra,
              Id: Id,
              subID: subid,
              Qty: qt
            }

            finalArray.push(ob)

          }

          subTotal = itemTotal + totalTax + dc + packingCharge + rainCharge

          if (error == 0) {
            // fetch address now
            // check res status before ordering

            bytesHelper.getSingleAddress(uid, aid).then((aidRes => {
              if (aidRes != null) {
                let orderOb = {
                  address: JSON.stringify(aidRes),
                  comments: notes,
                  cust_order_id: "",
                  date: dateF,
                  dboy: "",
                  delivery: Math.round(dc),
                  idc: dc,
                  distance: Math.round(dis),
                  idis: dis,
                  duration: duration,
                  fcm: fcm,
                  food: JSON.stringify(finalArray),
                  home_name: "",
                  item_total: Math.round(itemTotal),
                  iit: itemTotal,
                  name: name,
                  pc: Math.round(packingCharge),
                  ipc: packingCharge,
                  phone_number: "",
                  place: "",
                  ra: rainCharge,  // rain charge
                  res_id: rid,
                  res_title: resTitle + ',' + resPhone,
                  tax: Math.round(totalTax),
                  itax: totalTax,
                  time: timeF,
                  total_amount: Math.round(subTotal),
                  isub: subTotal,
                  type: "order",
                  dev: 2,
                  userid: uid,
                  status: "0,Order Placed",
                  paid: pm,
                  clt: "",
                  act: "",
                  dlt: "",
                  olt: "",
                  pm_id: ""
                }

                if (pm == 2) {
                  const mainRef = db.ref('Area/' + area + '/orders').push();
                  const tempRef = db.ref('Area/' + area + '/temp_orders/' + mainRef.key);
                  tempRef.set(orderOb).then(function () {

                    let razorAm = subTotal * 100
                    var options = {
                      amount: razorAm.toString(),
                      currency: "INR",
                      receipt: mainRef.key
                    };
                    instance.orders.create(options, function (err, order) {
                      if (err) {

                        res.json({
                          status: 0,
                          order_key: "",
                          razor_order_key: "",
                          msg: "Couldn't start online payment. Please try again",
                          temp_order_key: "",
                          total: 0
                        })

                      }
                      else {
                        res.json({
                          status: 2,
                          order_key: "",
                          razor_order_key: order.id,
                          msg: "",
                          temp_order_key: mainRef.key,
                          total: subTotal
                        })
                      }
                    });

                  }, (errorObject) => {

                    res.json({
                      status: 0,
                      order_key: "",
                      razor_order_key: "",
                      msg: "Couldn't place your order, Please re order.",
                      temp_order_key: "",
                      total: 0
                    })

                  });
                }
                else {
                  const orderRef = db.ref('Area/' + area + '/orders').push();
                  const resOrderRef = db.ref('Area/' + area + '/shop_order/' + rid).push();
                  orderRef.set(orderOb).then(function () {

                    res.json({
                      status: 1,
                      order_key: orderRef.key,
                      razor_order_key: "",
                      msg: "",
                      temp_order_key: "",
                      total: subTotal
                    })

                    let userOrderData = {
                      u: uid,
                      k: orderRef.key,
                      a: area,
                      d: dateF
                    }

                    bytesHelper.addOrder(userOrderData)
                    resOrderRef.set(orderRef.key)

                  }, (errorObject) => {

                    res.json({
                      status: 0,
                      order_key: "",
                      razor_order_key: "",
                      msg: "Couldn't place your order, Please re order.",
                      temp_order_key: "",
                      total: 0
                    })

                  });
                }
              }
              else {

                res.json({
                  status: 0,
                  order_key: "",
                  razor_order_key: "",
                  msg: "Couldn't get your address, Please re order.",
                  temp_order_key: "",
                  total: 0
                })
              }
            }))
          }
          else {
            error = 1
            res.json({
              status: 0,
              order_key: "",
              razor_order_key: "",
              msg: "Some error found in your cart items, Please re order.",
              temp_order_key: "",
              total: 0
            })
          }

        }
        else {
          error = 1
          res.json({
            status: 0,
            order_key: "",
            razor_order_key: "",
            msg: "Some error found in your cart items, Please re order.",
            temp_order_key: "",
            total: 0
          })
        }

      }, (errorObject) => {
        error = 1
        console.log("error " + errorObject)
      });

    }
    else {
      res.json({
        status: 0,
        order_key: "",
        razor_order_key: "",
        msg: "Some error found in your cart items, Please re order.",
        temp_order_key: "",
        total: 0
      })
    }
  }
  else {
    error = 1
    res.json({
      status: 0,
      order_key: "",
      razor_order_key: "",
      msg: "Some error found in your cart items, Please re order.",
      temp_order_key: "",
      total: 0
    })

  }


  if (error == 1) {
    res.json({
      status: 0,
      order_key: "",
      razor_order_key: "",
      msg: "Some error occurred, Please re order.",
      temp_order_key: "",
      total: 0
    })
  }

})

router.post('/calcDeliveryCharge', (req, res) => {

  let userLat = req.body.userLat
  let userLng = req.body.userLng
  let resLat = req.body.resLat
  let resLng = req.body.resLng
  let itemTotal = parseFloat(req.body.itemTotal)
  let minFree = parseFloat(req.body.minFree)
  let km_ch = parseFloat(req.body.km_ch)
  let km_ch_2 = parseFloat(req.body.km_ch_2)

  let min_ch = 20
  let min_km = 1
  let min_km_2 = 3

  var distance = 0
  var duration = 0
  var deliveryCharge = 0


  axios.get('https://maps.googleapis.com/maps/api/distancematrix/json?units=km&origins=' + resLat + ',' + resLng + '&destinations=' + userLat + ',' + userLng + '&key=AIzaSyBaxdI9cgj-Cln97faKXvBHh4q-ccyTZNY')
    .then(mapRes => {

      if (mapRes.data.status == 'OK' && mapRes.data.rows[0].elements[0].status == 'OK') {
        distance = parseFloat(((mapRes.data.rows[0].elements[0].distance.value) / 1000).toFixed(1))
        duration = Math.round((mapRes.data.rows[0].elements[0].duration.value) / 60)
      }
      else {
        distance = getDistanceFromLatLonInKm(userLat, userLng, resLat, resLng)
      }

      if (itemTotal < minFree) {
        deliveryCharge = calcDC(distance, min_ch, min_km, min_km_2, km_ch, km_ch_2)
      }
      else {
        deliveryCharge = 0
      }

      res.json({
        status: 1,
        dc: deliveryCharge,
        dis: distance,
        dur: duration
      })

    })
    .catch(err => {
      distance = getDistanceFromLatLonInKm(userLat, userLng, resLat, resLng)
      if (itemTotal < minFree) {
        deliveryCharge = calcDC(distance, min_ch, min_km, min_km_2, km_ch, km_ch_2)
      }
      else {
        deliveryCharge = 0
      }

      res.json({
        status: 1,
        dc: deliveryCharge,
        dis: distance,
        dur: duration
      })

    })


})


router.post('/getOrderHistory', (req, res) => {

  let uid = req.body.uid
  let skip = parseInt(req.body.skip)
  let limit = parseInt(req.body.limit)
  var end = 0
  var array = []


  let ts = Date.now();
  let date_ob = new Date(ts);
  let month = date_ob.getMonth() + 1

  let monthString = ""
  if (month < 10) { monthString = "0" + month }
  else { monthString = month.toString() }

  bytesHelper.getOrderHistory(uid, skip, limit).then((orderRes => {
    if (orderRes != null) {
      if (orderRes.length > 0) {
        array = orderRes
        if (array.length < limit) { end = 1 }
      }
      else { end = 1 }
    }
    else {
      end = 1
    }

    if (array.length > 0) {
      let mm = getOrdersFromArea(array, monthString)

      mm.then(function (result) {

        res.json({
          status: 1,
          end: end,
          list: result
        })
      })
    }
    else {
      res.json({
        status: 0,
        end: 0,
        list: []
      })
    }


  }))


})

router.post('/CancelOrderCustomer', (req, res) => {

  let oid = req.body.id
  let rid = req.body.rid
  let area = req.body.area

  let ts = Date.now();
  let date_ob = new Date(ts);
  let hourString = ""
  var am = ""

  if (date_ob.getHours() >= 12) {
    let hh = date_ob.getHours() - 12
    am = "pm"
    if (hh < 10) { hourString = "0" + hh.toString() }
    else { hourString = hh.toString() }
  }
  else {
    am = "am"
    if (date_ob.getHours() < 10) { hourString = "0" + date_ob.getHours() }
    else { hourString = date_ob.getHours().toString() }
  }

  let minuteString = ""
  if (date_ob.getMinutes() < 10) { minuteString = "0" + date_ob.getMinutes() }
  else { minuteString = date_ob.getMinutes().toString() }

  let timeF = hourString + ":" + minuteString + " " + am

  const db = admin.database();
  const ref = db.ref('Area/' + area + '/orders/' + oid);

  ref.once('value', (snapshot) => {
    let split = snapshot.val().status.split(",")
    if (split[0] == '0') {

      let mao = {
        '/status': '4,Cancelled by Customer',
        '/clt': timeF
      }
      ref.update(mao).then(function () {

        res.json({
          status: 1,
          string: ""
        })

        if (snapshot.hasChild("paid") && snapshot.hasChild("pid")) {
          let paym = parseInt(snapshot.val().paid)
          let pid = snapshot.val().pid
          if (paym == 2 && pid != '') {
            instance.payments.refund(pid)
          }
        }


        const resRef = db.ref('Area/' + area + '/shop_order/' + rid).push();
        let mm = {
          key: "abc",
          accepted: "",
          mute: 1
        }
        resRef.set(mm)

      }, (errorObject) => {

        res.json({
          status: 0,
          string: "Some Error Occurred, Please try again or contact Bytes Support"
        })

      });

    }
    else if (split[0] == '1') {
      res.json({
        status: 2,
        string: "Sorry ! Restaurant had confirmed your order just now. Please contact restaurant for cancellation"
      })
    }
    else if (split[0] == '4') {
      res.json({
        status: 2,
        string: "Sorry ! Your order is already cancelled."
      })
    }
    else {
      res.json({
        status: 0,
        string: "Some Error Occurred, Please try again or contact Bytes Support"
      })
    }


  }, (errorObject) => {
    res.json({
      status: 0,
      string: "Some Error Occurred, Please try again or contact Bytes Support"
    })
  });


})

router.post('/completeOrder', (req, res) => {

  let oid = req.body.temp
  let paymentId = req.body.paymentId
  let area = req.body.area


  const db = admin.database();
  const tempRef = db.ref('Area/' + area + '/temp_orders/' + oid);
  const ref = db.ref('Area/' + area + '/orders/' + oid);


  tempRef.once('value', (snapshot) => {

    if (snapshot.val() != null) {
      let obj = snapshot.val()
      obj.pid = paymentId
      ref.set(obj).then(function () {

        res.json({
          status: 1,
          string: oid
        })

        const resOrderRef = db.ref('Area/' + area + '/shop_order/' + obj.res_id).push();

        let userOrderData = {
          u: obj.userid,
          k: oid,
          a: area,
          d: obj.date
        }

        bytesHelper.addOrder(userOrderData)
        resOrderRef.set(oid)

      }, (errorObject) => {

        res.json({
          status: 0,
          msg: 1,
          string: "Couldn't complete your order. Please amount is debited from account, please contact bytes support"
        })

      })
    }
    else {
      res.json({
        status: 0,
        msg: 2,
        string: "Couldn't complete your order. Please amount is debited from account, please contact bytes support"
      })
    }

  }, (errorObject) => {
    res.json({
      status: 0,
      msg: 3,
      string: "Couldn't complete your order. Please amount is debited from account, please contact bytes support"
    })
  });


})

router.post('/getHelpContact', (req, res) => {

  let area = req.body.area
  const db = admin.database();
  const ref = db.ref('Area/area_list/' + area + '/admin_contact');

  ref.once('value', (snapshot) => {
    res.json({
      status: 1,
      string: snapshot.val().toString()
    })
  }, (errorObject) => {
    res.json({
      status: 0,
      string: ""
    })
  });

})

router.post('/refund', (req, res) => {

  instance.payments.refund('pay_JhS3PIsqZaKtGi', function (err, success) {
    if (err) {
      res.json(err)
    }
    else {
      res.json(success)
    }
  })


})




//// RIDER APIS ///

router.post('/removePendingOrder', (req, res) => {

  let oid = req.body.oid
  let rid = req.body.rid
  let area = req.body.area

  const db = admin.database();
  const ref = db.ref('Area/' + area + '/riders/' + rid + '/pending/' + oid);
  ref.set(null).then(function () {
    res.json({
      status: 1,
      string: ""
    })
  })

})

router.post('/acceptOrderRider', (req, res) => {

  let oid = req.body.oid
  let rid = req.body.rid
  let name = req.body.name
  let area = req.body.area

  const db = admin.database();
  const orderRef = db.ref('Area/' + area + '/orders/' + oid + '/dboy');
  const ref = db.ref('Area/' + area + '/riders/' + rid + '/pending/' + oid);
  orderRef.set(name + "," + rid).then(function () {
    res.json({
      status: 1,
      string: ""
    })
    ref.set(1)
  })

})

router.post('/changeStatusRider', (req, res) => {

  let oid = req.body.oid
  let rid = req.body.rid
  let name = req.body.name
  let area = req.body.area

  const db = admin.database();
  const orderRef = db.ref('Area/' + area + '/orders/' + oid);

  orderRef.once('value', (snapshot) => {
    let temp = snapshot.val().status.split(",")
    let status = parseInt(temp[0])

    console.log(snapshot.val().dboy)
    console.log(name + "," + rid)
    if (snapshot.val().dboy == name + "," + rid) {
      if (status == 1) {
        let map = {
          "/status": "2," + name + "/" + rid,
          "/olt": "time"
        }
        orderRef.update(map).then(function () {
          res.json({
            status: 1,
            string: "Make Delivered"
          })
        })
      }
      else if (status == 2) {
        let map = {
          "/status": "3, Delivered Successfully",
          "/dlt": "time"
        }

        let te = snapshot.val().distance.toString()
        var dis = 0
        if (te != '')
          dis = parseFloat(te)

        if (dis > 0) {

        }
        else {
          res.json({
            status: -1,
            string: "No Distance"
          })
        }
        console.log(dis)
        // orderRef.update(map).then(function () {
        //   res.json({
        //     status: 1,
        //     string: "done"
        //   })    
        // })
      }
    }
    else {
      res.json({
        status: 0,
        string: "Rider not matched"
      })
    }
  }, (errorObject) => {
    res.json({
      status: 0,
      string: "Order data not found"
    })
  });


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

function calcDC(distance, min_ch, min_km, min_km_2, km_ch, km_ch_2) {

  var dc = 0
  if (distance > min_km) {
    let extraKm = distance - min_km
    if (extraKm > min_km_2) {
      let extraKm2 = extraKm - min_km_2
      let extraCharge2 = extraKm2 * km_ch_2
      let xcs = min_km_2 * km_ch
      dc = min_ch + xcs + extraCharge2
    }
    else {
      let extraCharge = extraKm * km_ch
      dc = min_ch + extraCharge
    }
  }
  else {
    dc = min_ch
  }
  return parseFloat(dc.toFixed(2));
}

function deg2rad(deg) {
  return deg * (Math.PI / 180)
}

async function getNilImages(obj) {

  var map = {}
  var keys = Object.keys(obj)
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i]
    await axios.get('https://firebasestorage.googleapis.com/v0/b/delivery-58fd5.appspot.com/o/ponnani%2Fimages%2Fnew_data%2F' + k + '.webp?alt=media')
      .then(res => {

      })
      .catch(err => {
        map[keys[i] + "/i"] = ""
        console.log("not found")
      })
  }

  return map
}

async function getResFromAreas(areaMap) {

  var resList = []
  var imgs = {}
  var allResArray = {}
  for (const each in areaMap) {

    var tempArray = areaMap[each]
    var keys = Object.keys(tempArray);
    allResArray[each] = keys
    const rrr = admin.database().ref('Area/' + each + '/shop')
    await rrr.once('value', (snapshot) => {
      snapshot.forEach((child) => {

        if (keys.includes(child.val().c)) {
          var obj = child.val()

          if (obj.status == "open") {
            // check timings here
            obj.status = 2
          }
          else {
            obj.status = 0
          }


          var dd = tempArray[child.val().c]
          var rounded = Math.round(dd * 10) / 10
          obj.dis = rounded
          obj.an = each
          resList.push(obj)
        }

      })

    }, (errorObject) => {

    });

    // Getting Slider Images
    const imgRef = admin.database().ref('Area/' + each + '/new_check/home_image_ios')
    await imgRef.once('value', (snapshot) => {
      imgs[each] = snapshot.val()
    }, (errorObject) => {

    });
  }


  let imgKeys = Object.keys(imgs)
  var imgArray = []
  for (var i = 0; i < imgKeys.length; i++) {
    var ob = imgs[imgKeys[i]]

    if (ob != null) {
      let subKey = Object.keys(ob)
      let resArr = allResArray[imgKeys[i]]

      for (var j = 0; j < subKey.length; j++) {
        var subOb = ob[subKey[j]]
        if (subOb.type == 'restaurant' && !resArr.includes(subOb.target)) {
          continue
        }

        subOb["id"] = subKey[j]
        subOb["an"] = imgKeys[i]
        delete subOb.description

        imgArray.push(subOb)
      }
    }


  }



  let mm = {
    res: resList,
    imgs: imgArray
  }
  return mm
}

async function getOrdersFromArea(keyArray, monthString) {

  var orderList = []

  for (var i = 0; i < keyArray.length; i++) {
    let mon = (keyArray[i].d.split("-"))[1]
    if (mon == monthString) {
      const rrr = admin.database().ref('Area/' + keyArray[i].a + '/orders/' + keyArray[i].k)
      await rrr.once('value', (snapshot) => {
        if (snapshot.val() != null) {
          var ob = snapshot.val()
          ob['id'] = keyArray[i].k
          ob['an'] = keyArray[i].a
          ob['loc'] = "orders"
          orderList.push(ob)
        }

      });
    }
    else {
      const rrr = admin.database().ref('Area/' + keyArray[i].a + '/order_dumb/' + keyArray[i].k)
      await rrr.once('value', (snapshot) => {
        if (snapshot.val() != null) {
          var ob = snapshot.val()
          ob['id'] = keyArray[i].k
          ob['an'] = keyArray[i].a
          ob['loc'] = "order_dumb"
          orderList.push(ob)
        }
      });
    }
  }
  return orderList
}
