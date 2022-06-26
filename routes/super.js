var express = require('express');
const { response } = require('../app');
var router = express.Router();
var suHelper = require('../helpers/su-helper');
const { route } = require('./user');

router.get('/22/:name', function (req, res) {

  suHelper.doLogin(req.params.name).then((responce) => {

    if (responce.status && responce.user != null)
    {
      let suData = req.session.suData
      if (suData != null && req.session.suLogged)
      {
        res.render('super/dashboard', {suData})
      }
      else
      {
        res.render('super/check_key', { suData: responce.user })
      }
    }
    else
    {
      res.status(404).send('page not found')
    }
  })
});

router.post('/login', (req, res) => {

  suHelper.checkKey(req.body).then((responce) => {
    if (responce.status && responce.user != null) {

      req.session.suData = responce.user
      req.session.suLogged = true
      res.render('super/dashboard', {suData: responce.user})
    }
    else {
      res.status(404).send('page not found')
    }
  })
});

router.get('/expense', (req, res) => {
  res.render('super/expense')
})

router.get('/add-expense', (req, res) => {
  res.render('super/add-expense')
})

router.get('/sales', (req, res) => {
  // let suData = req.session.suData
  //   if (suData != null && req.session.suLogged)
  //   {
  //     res.render('super/sales-users')
  //   }
  //   else
  //   {
  //     res.status(404).send('page not found')
  //   }

  // then get 10 sales user
  suHelper.getDefaultSalesUsers(req.body).then((responce) => {
    res.render('super/sales-users', {data: responce})
  })

  

})

router.get('/add-sales-user', (req, res) => {
  // check session
  res.render('super/add-sales-user')
})

router.post('/add-sales-user', (req, res) => {
  // check session

  let ts = Date.now();
  let date_ob = new Date(ts);

  let month = date_ob.getMonth() + 1
  let monthString = ""
  if (month < 10) { monthString = "0" + month }
  else { monthString = month.toString() }

  let dayString = ""
  if (date_ob.getDate() < 10) { dayString = "0" + date_ob.getDate() }
  else { dayString = date_ob.getDate().toString() }

  var hours = date_ob.getHours();
  var minutes = date_ob.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var time = hours + ':' + minutes + ' ' + ampm;
  let dateF = date_ob.getFullYear() + "-" + monthString + "-" + dayString
  req.body.ct = dateF + "," + time
  
  suHelper.addSalesUser(req.body).then((responce) => {

    if (responce) {
      res.redirect('/su/sales')
    }
    else {
      res.status(404).send('404 Error')
    }
  })

})

/// Adding expense

router.post('/add-expense', (req, res) => {

  let ts = Date.now();
  let date_ob = new Date(ts);
  let month = date_ob.getMonth() + 1
  req.body.date = date_ob.getDate() + "-" + month + "-" + date_ob.getFullYear()
  req.body.time = date_ob.getHours() + ":" + date_ob.getMinutes() + ":" + date_ob.getSeconds()

  suHelper.addExpense(req.body).then((responce) => {

    console.log(responce)
    // if (responce) {
    //   res.redirect('/su/expense')
    // }
    // else {
    //   console.log("failed");
    // }
  })
})




module.exports = router;
