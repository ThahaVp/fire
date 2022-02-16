var express = require('express');
const { response } = require('../app');
var router = express.Router();
var suHelper = require('../helpers/su-helper');
const { route } = require('./user');

router.get('/22/:name', function(req, res) {
  suHelper.doLogin(req.params.name).then((responce)=>{
    if(responce.status && responce.user != null)
    {
      res.render('super/check_key', {suData: responce.user})
    }
    else
    {
      res.status(404).send('page not found')
    }
  })
});

router.post('/login', (req,res)=>{

  suHelper.checkKey(req.body).then((responce) =>{
  if(responce.status && responce.user != null)
  {
    res.render('super/dashboard')
  }
  else
  {
    console.log("failed");
  }
  })
 });

 router.get('/expense', (req,res)=>{
   res.render('super/expense')
 })

 router.get('/add-expense', (req,res)=>{
  res.render('super/add-expense')
})

router.post('/add-expense', (req, res) => {

  let ts = Date.now();
  let date_ob = new Date(ts);
  let month = date_ob.getMonth() + 1 
  req.body.date = date_ob.getDate() + "-" + month + "-" + date_ob.getFullYear()
  req.body.time = date_ob.getHours() + ":" + date_ob.getMinutes() + ":" + date_ob.getSeconds()


  suHelper.addExpense(req.body).then((responce) => {

    if (responce) {
      res.redirect('/su/expense')
    }
    else {
      console.log("failed");
    }
  })
})



module.exports = router;
