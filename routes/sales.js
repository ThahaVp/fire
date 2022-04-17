var express = require('express');
const { response } = require('../app');
var router = express.Router();
var salesHelper = require('../helpers/sales-helper');
const { route } = require('./user');

router.get("/add-store", (req,res)=>{
  res.render('sales/add-store', {logged:true,});
})

router.post('/add-store', (req, res) => {

  let ts = Date.now();
  let date_ob = new Date(ts);
  let month = date_ob.getMonth() + 1 
  
  let monthString = ""
  if (month<10){monthString = "0"+month}
  else {monthString = month.toString()}

  let dayString = ""
  if (date_ob.getDate() < 10) { dayString = "0"+date_ob.getDate()}
  else {dayString = date_ob.getDate().toString()}

  let hourString = ""
  if (date_ob.getHours() < 10) { hourString = "0"+date_ob.getHours()}
  else {hourString = date_ob.getHours().toString()}
  
  let minuteString = ""
  if (date_ob.getMinutes() < 10) { minuteString = "0"+date_ob.getMinutes()}
  else {minuteString = date_ob.getMinutes().toString()}

  let secondString = ""
  if (date_ob.getSeconds() < 10) { secondString = "0"+date_ob.getSeconds()}
  else {secondString = date_ob.getSeconds().toString()}

  let time = hourString + ":" + minuteString + ":" + secondString
  let dateF = date_ob.getFullYear() + "-" + monthString + "-" + dayString

  req.body.cr_dt = dateF
  req.body.cr_ti = time

  var otherDetails = 
  {
    'admin_name': req.body.admin_name,
    'admin_contact': req.body.admin_contact,
    'created_time': req.body.cr_ti,
    'created_date': req.body.cr_dt
  }

  delete req.body.admin_name
  delete req.body.admin_contact
  delete req.body.cr_ti
  delete req.body.cr_dt

  console.log(req.body)
  console.log(otherDetails)

  res.json(req.body)

  // salesHelper.addStore(req.body, otherDetails).then((responce) => {

  //   if (responce != null) {
  //     res.json(responce)
  //   }
  //   else {
  //     res.json({id: "", status: 0})
  //   }
  // })
})



module.exports = router;
