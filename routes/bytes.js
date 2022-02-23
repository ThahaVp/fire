var express = require('express');
var router = express.Router();
//var bytesHelper = require('../helpers/bytes-helper');
var pdf = require('html-pdf');
var options = { format: 'A4' };


router.get('/generateInvoice', (req,res)=>{
  
  let ts = Date.now();
  let date_ob = new Date(ts);
  let month = date_ob.getMonth() + 1 
  let time = date_ob.getHours() + ":" + date_ob.getMinutes() + ":" + date_ob.getSeconds()
  let dateF = date_ob.getFullYear() + "-" + month + "-" + date_ob.getDate()
  req.body.dt = dateF
  req.body.ti = time

  var html = "<!DOCTYPE html> <html lang='en'> <head> <meta charset='UTF-8'> <meta http-equiv='X-UA-Compatible' content='IE=edge'> <meta name='viewport' content='width=device-width, initial-scale=1.0'> <title>Order Tax Invoice</title> </head> <style> body { font-family: 'Open Sans', sans-serif; } .text { font-size: 10px; line-height: 1.5; } td { padding: 3px; margin: 0; } h3, p { margin: 0; font-size: 10px; } .tt, .tt td, .tt th { border: 1px solid; text-align: center; } .tt { width: 100%; margin-top: 30px; } table { border-collapse: collapse; } </style> <body> <div style='width: 95%; margin-left: auto;margin-right: auto;'> <img style='width: 100px;' src='https://lh3.googleusercontent.com/p/AF1QipOxdwx9QazNoSMYsqfnD8SIfElufbjiWbMncNMX=w768-h768-n-o-v1'/> <h3 style='text-align: center;'>Tax Invoice</h3> <p class='text' style='text-align: center;'>ORIGINAL For Recipient</p> <table style='margin-top: 20px;'> <tr> <td><h3>Invoice Number</h3></td> <td>:</td> <td><p class='text'>165</p></td> </tr> <tr> <td><h3>Invoice Date</h3></td> <td>:</td> <td><p class='text'>24-10-2022</p></td> </tr> <tr> <td><h3>Order ID</h3></td> <td>:</td> <td><p class='text'>-idsnBht65FcVdkam99N</p></td> </tr> <tr> <td><h3>Restaurant Name</h3></td> <td>:</td> <td><p class='text'>Jawas Restaurant</p></td> </tr> <tr> <td></td> <td></td> </tr> <tr> <td><h3>Customer Name</h3></td> <td>:</td> <td><p class='text'>Thaha Vp</p></td> </tr> <tr> <td><h3>Delivery Address</h3></td> <td>:</td> <td><p class='text'>Chanthappadi, Ponnani</p></td> </tr> </table> <table class='tt'> <tr> <td><h3>Items</h3></td> <td><h3>Gross Value</h3></td> <td><h3>Discount</h3></td> <td><h3>Net Value</h3></td> <td><h3>CGST</h3></td> <td><h3>SGST</h3></td> <td><h3>Total</h3></td> </tr> <tr> <td><p class='text'>2 X Chicken Chilly<br>2X Poratta</p></td> <td><p class='text'>780</p></td> <td><p class='text'>0</p></td> <td><p class='text'>780</p></td> <td><p class='text'>19.5</p></td> <td><p class='text'>19.5</p></td> <td><p class='text'>819</p></td> </tr> <tr> <td><h3>Total Value</h3></td> <td></td> <td></td> <td><p class='text'>780</p></td> <td><p class='text'>19.5</p></td> <td><p class='text'>19.5</p></td> <td><p class='text'>819</p></td> </tr> </table> <table style='margin-top: 20px;'> <tr> <td><h3>Amount (in words)</h3></td> <td>:</td> <td><p class='text'>Eight hundred twenty nine Rupees and zero paisa only</p></td> </tr> </table> <h3 style='margin-top: 20px;'>BYTES DELIVERY LLP</h3> <p class='text' style='margin-top: 5px;'>Bytes PAN : </p> <p class='text'>Bytes GST : </p> </div> </body> </html>"
  pdf.create(html, options).toFile('./public/customer_invoice/invoice.pdf', function(err, res) {
    if (err) return console.log(err);
    console.log(res); // { filename: '/app/businesscard.pdf' }
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
