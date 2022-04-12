var express = require('express');
var router = express.Router();
var rvHelper = require('../helpers/rv-helper')


router.get('/test', (req,res)=>{
  res.json({
    status: 1,
    time: "test",
    date: "done"
  })
})

router.post('/addExpense', (req,res)=>{
  
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

  req.body.dt = dateF
  req.body.ti = time
  req.body.ed = 0

  rvHelper.addExpense(req.body).then((responce) =>
  {
    if (responce)
    {
      console.log(responce)
      res.json({
        status: 1,
        time: time,
        date: dateF,
        id: responce.toString()
      })
    }
    else
    {
      res.json({
        status: 0,
        time: time,
        date: dateF,
        id: ""
      })
    }
  })
})

router.post('/getExpenseOnDate', (req,res)=>{
  rvHelper.getExpenseOnDate(req.body.dt).then((responce) =>
  {
    if (responce)
    {
      res.json({
        status: 1,
        result: responce
      })
    }
    else
    {
      res.json({
        status: 0,
        result: []
      })
    }
  })
})

router.get('/editExpense', (req,res)=>{
  rvHelper.editExpense(req.body).then((responce) =>
  {
    if (responce)
    {
      res.json({
        status: 1
      })
    }
    else
    {
      res.json({
        status: 0
      })
    }
  })
})

router.post('/addStock', (req,res)=>{

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
  
  var array = 
  {
    p : parseFloat(req.body.p),
    rp : parseFloat(req.body.rp),
    s : req.body.s,
    c : req.body.c,
    t : req.body.t,
    q : parseInt(req.body.q),
    ti : time,
    dt : dateF
  }

  rvHelper.addStock(array).then((responce) =>
  {
    if (responce)
    {
      res.json({
        status: 1,
        model: responce
      })
    }
    else
    {
      res.json({
        status: 0,
        model: {}
      })
    }
  })
})

router.post('/updateStock', (req,res)=>{
  rvHelper.updateStock(req.body).then((responce) =>
  {
    if (responce != null)
    {
      res.json({
        status: responce
      })
    }
    else
    {
      res.json({
        status: 0
      })
    }
  })
})

router.post('/getStock', (req,res)=>{
  rvHelper.getStock(req.body.type).then((responce) =>
  {
    if (responce && responce.length > 0)
    {
      res.json({
        status: 1,
        result: responce
      })
    }
    else
    {
      res.json({
        status: 0,
        result: []
      })
    }
  })
})

router.post('/makeSale', (req,res)=>{

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

  var array = 
  {
    json: JSON.parse(req.body.cart),
    ti : time,
    dt : dateF,
    cu : req.body.cn,
    cc : req.body.cp,
    ad : req.body.admin_id
  }

  rvHelper.makeSale(array).then((responce) =>
  {
    if (responce)
    {
      res.json(responce)
    }
  })
})

router.post('/getSale', (req,res)=>{
  rvHelper.getSale(req.body.date).then((responce) =>
  {
    if (responce && responce.length > 0)
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
  })
})


module.exports = router;
