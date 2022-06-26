var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helper')

router.get('/', function(req, res, next) {
  
  productHelper.getAllProducts().then((products) => {
    res.render('admin/view-products', {admin:true , products});
  })
});

router.get("/add-product", (req,res)=>{
  res.render('admin/add-product', {admin:true,});
})

router.get("/dashboard", (req,res)=>{
  res.render('admin/dashboard-home', {admin:true,});
})

router.get("/settings", (req,res)=>{
  res.render('admin/settings', {admin:true,});
})

router.get("/orders", (req,res)=>{
  res.render('admin/orders', {admin:true,});
})

router.get("/menu", (req,res)=>{
  res.render('admin/menu-tab', {admin:true,});
})

router.get("/setup-store", (req,res)=>{
  res.render('admin/setup-store', {admin:true,});
})

router.post("/add-product", (req,res)=>{
  productHelper.addProduct(req.body, (result)=>{

    res.send(result)
    console.log(req.files);
    res.send(req.files)
  
  })  
})

router.get('/delete-product/:id', (req,res)=>{
  let proID = req.params.id
  productHelper.deleteProduct(proID).then((responce)=>{
    console.log("responce = "+ responce);
    res.redirect('/admin/')
  })

})


router.get('/edit-product/:id', async(req,res)=>{
  let proID = req.params.id
  let product = await productHelper.getProduct(proID)
  res.render('admin/edit-product', {product})

})

router.post("/edit-product/:id", (req,res)=>{
  console.log(req.files)
  productHelper.updateProduct(req.params.id, req.body).then(()=>{
    res.redirect('/admin')
  })

})


///// DOCTOR ///////
router.get('/doctor', async(req,res)=>{
  res.render('admin/doctor')
})


// API
// router.get('/api/test', (req,res)=>{
//   console.log(req)
//   res.json({
//     status: 'ok',
//     message: 'API working'
//   })
// })

module.exports = router;
