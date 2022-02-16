var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helper')
var userHelper = require('../helpers/user-helper')

const verifyLogin = (req,res,next)=>
{
  if(req.session.loggedIn && req.session.user != null)
  {
    next()
  }
  else
  (
    res.redirect('/login')
  )
}

/* GET home page. */
router.get('/', function(req, res, next) {
  let user = req.session.user
  productHelper.getAllProducts().then((products) => {
    res.render('user/view-products', {products, user})
  })
});

router.get('/login', (req,res)=>{
  console.log(req.session.loggedIn);
  if(req.session.loggedIn)
    {res.redirect('/')}
  else
    {
      res.render('user/login', {"loginErr": req.session.loginError})
      req.session.loginError = false
    }
})

router.get('/signup', (req,res)=>{
  res.render('user/singup')
})

const pro = [
  {
    'id':1,
    't':'Chicken Biriyani',
    'p':90.0, // Pirce
    'd':'Very tasty chicken biriyani made with very good rice and ingredients. you will love it',
    's':0, // Status
    'i':'', // Image
    'cz':'', // Customize Text
    'c':'Biriyani', // Category
    'r':25,  // Restaurant ID
    'v':0, // 1 == Veg 2 == Non Veg
    'sh':true, // Show/Hidden
    'ot': '',  // Opening Time
    'ct': ''  // Closing Time
  },
  {
    'id':2,
    't':'Mutton Biriyani',
    'p':120.0, // Pirce
    'd':'Very tasty chicken biriyani made with very good rice and ingredients. you will love it',
    's':0, // Status
    'i':'', // Image
    'cz':'', // Customize Text
    'c':'Biriyani', // Category
    'r':25,  // Restaurant ID
    'v':0, // 1 == Veg 2 == Non Veg
    'sh':true, // Show/Hidden
    'ot': '',  // Opening Time
    'ct': ''  // Closing Time
  },
  {
    'id':3,
    't':'Beef Biriyani',
    'p':110.0, // Pirce
    'd':'Very tasty chicken biriyani made with very good rice and ingredients. you will love it',
    's':0, // Status
    'i':'', // Image
    'cz':'', // Customize Text
    'c':'Biriyani', // Category
    'r':25,  // Restaurant ID
    'v':0, // 1 == Veg 2 == Non Veg
    'sh':true, // Show/Hidden
    'ot': '',  // Opening Time
    'ct': ''  // Closing Time
  },
  {
    'id':4,
    't':'Veg Biriyani',
    'p':80.0, // Pirce
    'd':'Very tasty chicken biriyani made with very good rice and ingredients. you will love it',
    's':0, // Status
    'i':'', // Image
    'cz':'', // Customize Text
    'c':'Biriyani', // Category
    'r':25,  // Restaurant ID
    'v':0, // 1 == Veg 2 == Non Veg
    'sh':true, // Show/Hidden
    'ot': '',  // Opening Time
    'ct': ''  // Closing Time
  }
]

const menu = [
  {
    't':'Biriyani',
    'i': pro
  },
  {
    't':'Breakfast',
    'i': pro
  },
  {
    't':'Lunch',
    'i': pro
  },
  {
    't':'Specials',
    'i': pro
  }
]

const category = ['Biriyani','Breakfast','Lunch','Specials']

router.get('/example', (req,res)=>{
  res.render('user/example', {menu, category})
})

router.get('/example/cart', (req,res)=>{
  res.render('user/cart', {menu, category})
})

router.post('/signup', (req,res)=>{
 userHelper.doSignup(req.body).then((responce) =>{
  if(responce.status && responce.user != null)
  {
    req.session.loggedIn = true
    req.session.user = responce.user
    res.redirect('/')
  }
 })
})

router.post('/login', (req,res)=>{

  userHelper.doLogin(req.body).then((responce) =>{
  if(responce.status && responce.user != null)
  {
    req.session.loggedIn = true
    req.session.user = responce.user
    res.redirect('/')
  }
  else
  {
    req.session.loggedIn = false
    req.session.loginError = true
    res.redirect('/login')
  }
  })
 })

 router.get('/logout', (req,res)=>{
   req.session.destroy()
   res.redirect('/')
 })

 router.get('/:name/store', (req,res)=>{
   res.send(req.params.name)
 })

 router.get('/add-to-cart', (req,res)=>{

})

 router.get('/cart',verifyLogin, (req,res)=>{
   res.render('user/cart')
 })
 



module.exports = router;
