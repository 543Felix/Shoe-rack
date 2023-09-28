const express = require('express')
const admin_route =express()
const adminController =require('../controllers/adminControllers')
const categoryController = require('../controllers/categoryController')
const productController = require('../controllers/productController')
const validate = require('../middilewares/adminAuth')
const multer = require('../multer/multer')
admin_route.set('view engine','ejs')
admin_route.set('views','./views/admin')

const cookieParser = require('cookie-parser')
const session = require('express-session')
admin_route.use(session({
    secret: 'your-secret-key', 
    resave: false,
    saveUninitialized: true
}))

admin_route.use(express.json())
admin_route.use(express.urlencoded({extended:true}))
admin_route.use(cookieParser())

admin_route.get('*',validate.checkAdmin)
admin_route.get('/',adminController.adminLogin)
admin_route.post('/',adminController.verifyLogin)
admin_route.get('/adminHome',validate.requireAuth,adminController.adminHome)
admin_route.get('/logout',adminController.logOut)
// product
admin_route.get('/addProduct',validate.requireAuth,productController.loadaddProduct)
admin_route.post('/addProduct',multer.upload,productController.createProduct)
admin_route.get('/productsList',validate.requireAuth,productController.displayProduct)
admin_route.get('/unListProduct',productController.unListProduct)
admin_route.get('/reListProduct',productController.reListProduct)
admin_route.get('/updateProduct',validate.requireAuth,productController.loadUpdateProduct)
admin_route.post('/updateProduct',multer.update,productController.updateProduct)
//Categories
admin_route.get('/showCategory',validate.requireAuth,categoryController.loadCategory)
admin_route.get('/addCategory',validate.requireAuth,categoryController.loadAddCategory)
admin_route.post('/addCategory',categoryController.createCategory)
admin_route.get('/unlistCategory',categoryController.unlistCategory)
admin_route.get('/relistCategory',categoryController.relistCategory)
admin_route.get('/updateCategory',validate.requireAuth,categoryController.loadupdateCategory)
admin_route.post('/updateCategory',categoryController.updateCategory)
//User
admin_route.get('/userList',validate.requireAuth,adminController.loadUsers)
admin_route.post('/blockUser',adminController.blockUser)
admin_route.post('/unBlockUser',adminController.unBlockUser)





module.exports= admin_route