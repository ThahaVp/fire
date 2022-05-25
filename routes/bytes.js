var express = require('express');
const axios = require('axios');
var router = express.Router();
var bytesHelper = require('../helpers/bytes-helper');
var pdf = require('html-pdf');
var options = { format: 'A4' };


var admin = require("firebase-admin");

var serviceAccount = require("../delivery-58fd5-firebase-adminsdk-pxhyn-f6c803d34a.json");
const async = require('hbs/lib/async');
const { ObjectId } = require('mongodb');

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

router.get('/testing', (req,res) => {

  const db = admin.database();
  const ref = db.ref('Area/ponnani/products/albaik');

  ref.on('value', (snapshot) => {
    
    var map = {}

    // snapshot.forEach((child) => {
    //   child.val().forEach((sub) => {
      
    //     map[sub.key] = "1"
  
    //   })
    // })

    var obj = snapshot.val()
    var keys = Object.keys(obj)
    

    for (var i=0; i<keys.length; i++)
    {
      
      var k = keys[i]
      // k = k.replace(/\s+/g,'%20');
      map[keys[i]+"/i"] = k+".webp"
      
      
      
    }

    res.json({
      status: 1,
      list: map
    })
     ref.update(map)

    
    

  }, (errorObject) => {
    console.log("Error "+errorObject)

})

})


// Incomplete
router.get('/findNoImages', (req,res) => {

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
    console.log("Error "+errorObject)

})

})

router.post('/getFoods', (req, res) => {

  var resID = req.body.id
  var area = req.body.area
  var resStatus = 1

  const db = admin.database();
  const ref = db.ref('Area/'+area+"/products/"+resID);
  
  ref.once('value', (snapshot) => {

    var list = []
    snapshot.forEach((child) => {
      var show = child.val().sh
      if (show == 1)
      {
        var obj = child.val()
        obj.qty = 0
        obj.key = child.key
        list.push(obj)
      }
    })

    if (list.length > 0)
    {
      res.json({
        status: 1,
        list: list,
        res_status: resStatus
      })
    }
    else
    {
      res.json({
        status: 0,
        list: [],
        msg: "empty",
        res_status: resStatus
      })
    }

}, (errorObject) => {
    res.json({
      status: 0,
      msg: "firebase error " + errorObject,
      list:[],
      res_status: resStatus
    })
  });
})

router.post('/getExtraInCart', (req, res) => {

  var resID = req.body.id
  var area = req.body.area
  var foods = req.body.foods.split(",")

  const db = admin.database();
  const ref = db.ref('Area/'+area+"/products/"+resID);

  ref.once('value', (snapshot) => {

    var list = []
    snapshot.forEach((child) => {
      if (foods.includes(child.key))
      {
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

    if (list.length > 0)
    {
      res.json({
        status: 1,
        foods: list,
        res_status: 1
      })
    }
    else
    {
      res.json({
        status: 0,
        foods: [],
        res_status: 0
      })
    }

}, (errorObject) => {
    res.json({
      status: 0,
      foods: [],
      res_status: 0
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
            slider: result.imgs
          }
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

router.post('/sendOtp', (req, resp) => {

  let phone = req.body.phone
  let apiKey = "7185fab5-db6e-11ec-9c12-0200cd936042"

  axios.get('https://2factor.in/API/V1/'+apiKey+'/SMS/+91'+phone+'/AUTOGEN')
  
  // Show response data
  .then(res => {
    if (res.data.Status == "Success")
    {
      resp.json({
        status: 1,
        string: res.data.Details
      })
    }
    else
    {
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

})

router.post('/verifyOtp', (req, resp) => {

  let phone = req.body.phone
  let otp = req.body.otp
  let id = req.body.id
  let apiKey = "7185fab5-db6e-11ec-9c12-0200cd936042"

  axios.get('https://2factor.in/API/V1/'+apiKey+'/SMS/VERIFY/'+id+'/'+otp)
  
  .then(res => {
    if (res.data.Status == "Success")
    {
      bytesHelper.getUserWithNumber(phone).then((responce => {
        console.log(responce)
        if (responce != null)
        {
          resp.json({
            status: 1,
            user_status: 1,
            user_data: responce
          })
        }
        else
        {
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
    else
    {
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

})

router.post('/addUser', (req, res) => {

  let phone = req.body.id
  let email = req.body.e
  let name = req.body.n
  let surname = req.body.s
  let type = parseInt(req.body.t)
  let device_id = req.body.d
  let fcm = req.body.f

  let data = 
  {
    id: phone,
    e: email,
    n: name,
    s: surname,
    t: type,
    d: device_id,
    f: fcm
  }

  bytesHelper.addUser(data).then((responce => {
    if (responce != null)
    {
      res.json({
        status: 1,
        string: responce
      })
    }
    else
    {
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
    if (responce != null)
    {
      res.json({
        status: 1,
        list: responce
      })
    }
    else
    {
      res.json({
        status: 0,
        list: []
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
    t: req.body.tid,
    a: req.body.aid,
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
  for (var i=0; i<keys.length; i++)
  {
    if (data.keys[i] == null)
    {
      data.key[i] = ""
    }
  }

  if (aid != "")
  {
    bytesHelper.updateAddress(data, uid).then((responce => {
      if (responce != null)
      {
        res.json({
          status: 1,
          string: newAid
        })
      }
      else
      {
        res.json({
          status: 0,
          string: ""
        })
      }
    }))
  }
  else
  {
    var newAid = new Date().valueOf().toString()
    data.id = newAid
    
    bytesHelper.addDeliveryAddress(data, uid).then((responce => {
      if (responce != null)
      {
        res.json({
          status: 1,
          string: newAid
        })
      }
      else
      {
        res.json({
          status: 0,
          string: ""
        })
      }
    }))

  }

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

async function getNilImages(obj) {

  var map = {}
    var keys = Object.keys(obj)
    for (var i=0; i<keys.length; i++)
    {
      var k = keys[i]
      await axios.get('https://firebasestorage.googleapis.com/v0/b/delivery-58fd5.appspot.com/o/ponnani%2Fimages%2Fnew_data%2F'+k+'.webp?alt=media')
      .then(res => {
        
      })
      .catch(err => {
        map[keys[i]+"/i"] = ""
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

        if (keys.includes(child.val().c))
        {
          var obj = child.val()

          // check time and decide status 
          obj.status = 2
          
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
    const imgRef = admin.database().ref('Area/' + each + '/new_check/home_image')
    await imgRef.once('value', (snapshot) => {
    imgs[each] = JSON.parse(snapshot.val())
    }, (errorObject) => {
      
    });
  }

  let imgKeys = Object.keys(imgs)
  var imgArray = []
  for (var i=0;i<imgKeys.length;i++)
  {
    var ob = imgs[imgKeys[i]]
    let subKey = Object.keys(ob)
    let resArr = allResArray[imgKeys[i]]

    for (var j=0; j<subKey.length; j++)
    {
      var subOb = ob[subKey[j]]
      if (subOb.type == 'restaurant' && !resArr.includes(subOb.target))
      {
        continue
      }

      subOb["id"] = subKey[j]
      subOb["an"] = imgKeys[i]
      delete subOb.description
      
      imgArray.push(subOb)
    }
    
  }

  let mm = {res: resList,
  imgs: imgArray}
  return mm
}
