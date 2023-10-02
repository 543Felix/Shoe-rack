const express = require('express');
const session = require('express-session')
const user_route = express();
const usercontroller = require('../controllers/userControllers');
const productController = require('../controllers/productController')
const wishListController = require('../controllers/wishListController')
const cartController = require('../controllers/cartController')
const validate = require('../middilewares/userAuth')
const Block = require('../middilewares/blockMiddileware')
const orderController = require('../controllers/orderController')
const profileController = require('../controllers/profileController')



const cookieParser = require("cookie-parser")
user_route.use(session({
    secret: 'your-secret-key', 
    resave: false,
    saveUninitialized: true
  }))

user_route.use(express.json())
user_route.use(express.urlencoded({extended:true}))
user_route.use(cookieParser())

user_route.all('*',validate.checkUser)

user_route.set('view engine','ejs')
user_route.set('views','./views/user')

user_route.get('/',usercontroller.userHomepage);
user_route.get('/login',usercontroller.userLogin)
user_route.post('/login',usercontroller.verifyLogin)
user_route.get('/registration',usercontroller.registration)
user_route.post('/registration',usercontroller.insertUser)
user_route.post('/verifyotp',usercontroller.verifyOtp)
user_route.get('/logout',usercontroller.logout)

// Product page
user_route.get('/shop',usercontroller.shopPage)
user_route.get('/categoryShop',usercontroller.categoryPage)
user_route.get('/product',productController.singleProduct)
// user_route.post('/addToWishlist',)

// Cart
user_route.post('/addToCart/:id',Block.checkBlocked,validate.requireAuth,cartController.addToCart)
user_route.get('/cart',Block.checkBlocked,validate.requireAuth,cartController.loadCart)
user_route.put( '/change-product-quantity',cartController.updateQuantity)
user_route.delete("/delete-product-cart",cartController.deleteProduct)

//checkOutAddress
user_route.get('/checkOut',orderController.checkOut)
user_route.post('/checkOut',orderController.postCheckOut)
user_route.post('/checkOutAddress',profileController.checkOutAddress)
user_route.post('/changeDefaultAddress',orderController.changePrimaryAddress)

//Profile
user_route.get('/dashboard',Block.checkBlocked,validate.requireAuth,profileController.loadDashboard)
user_route.get('/profileOrderList',Block.checkBlocked,validate.requireAuth,orderController.orderList)
user_route.get('/orderDetails',Block.checkBlocked,validate.requireAuth,orderController.orderDetails)
user_route.get('/profileAddress',Block.checkBlocked,validate.requireAuth,profileController.profileAdress)
user_route.put('/cancelOrder',orderController.cancelOrder)


module.exports = user_route ;