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
  req.body.cr_dt = date_ob.getDate() + "-" + month + "-" + date_ob.getFullYear()
  req.body.cr_ti = date_ob.getHours() + ":" + date_ob.getMinutes() + ":" + date_ob.getSeconds()

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

    if (responce) {
      res.json({
        status: 1,
        result: responce
      })
    }
    else {
      console.log("failed");
    }
  })
})



module.exports = router;
