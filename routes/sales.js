var express = require('express');
const { response } = require('../app');
var router = express.Router();
var salesHelper = require('../helpers/sales-helper');
const { route } = require('./user');

router.get("/add-store", (req,res)=>{
  res.render('sales/add-store');
})

router.get('/add-new-service', (req,res)=>{
  let salesData = req.session.salesData
      if (req.session.salesLogged && salesData != null)
      {
        res.render('sales/add-new-service')
      }
      else
      res.status(404).send('page not found')
  
})

router.get('/dashboard', (req,res)=>{
  let salesData = req.session.salesData
      if (req.session.salesLogged && salesData != null)
      {
        res.render('sales/dashboard', {salesData: salesData})
      }
      else
      res.status(404).send('page not found')
  
})



router.get("/:ww/", (req,res)=>{
  salesHelper.doLogin(req.params.ww).then((responce)=>{
    if(responce.status && responce.user != null)
    {
      let salesData = req.session.salesData
      if (req.session.salesLogged && salesData != null)
      {
        res.render('sales/dashboard', { salesData: salesData })
      }
      else
      {
        res.render('sales/sales-login', {data: responce.user})
      }
    }
    else
    {
      res.status(404).send('page not found')
    }
  })
})



router.post('/login', (req, res) => {

  salesHelper.checkKey(req.body).then((responce) => {
    if (responce.status && responce.user != null) {
      req.session.salesData = responce.user
      req.session.salesLogged = true
      res.redirect('/sales/dashboard')
    }
    else {
      res.status(404).send('page not found')
    }
  })
});


router.get("/add-billing/:ww/:lat/:lng/", (req,res)=>{
    res.render('sales/add-billing', {logged:true, ww: req.params.ww, lat: req.params.lat,
    lng: req.params.lng});  
})

router.get("/choose-theme/:ww", (req,res)=>{
  res.render('sales/choose-theme', {logged:true, ww: req.params.ww});  
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

  salesHelper.addStore(req.body, otherDetails).then((responce) => {

    if (responce != null) {
      res.json(responce)
    }
    else {
      res.json({id: "", status: 0})
    }
  })
})

router.post('/add-order-billing', (req, res) => {

  console.log(req.body)
  salesHelper.addOrderBilling(req.body).then((responce) => {

    if (responce != null) {
      res.json({status: responce})
    }
    else {
      res.json({status: 0})
    }
  })

})


///// DOCTOR ///////



router.post('/add-service/:lat/:lng/', (req, res) => {

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

  var otherDetails = 
  {
    'admin_name': req.body.man_name,
    'admin_id': req.body.man_cont,
    'created_time': dateF,
    'created_date': time
  }

  delete req.body.man_name
  delete req.body.man_cont

  salesHelper.addService(req.body, otherDetails).then((responce) => {

    if (responce != null) {
      res.json(responce)
    }
    else {
      res.json({id: "", status: 0})
    }
  })
})

router.get("/add-service-payment/:ww/", (req,res)=>{
  res.render('sales/add-service-payment', {logged:true, ww: req.params.ww,});  
})



module.exports = router;
