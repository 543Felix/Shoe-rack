const express = require('express')
const admin_route =express()
const adminController =require('../controllers/adminControllers')
const categoryController = require('../controllers/categoryController')
const productController = require('../controllers/productController')
const validate = require('../middilewares/adminAuth')
const multer = require('../multer/multer')
const couponController = require('../controllers/couponController')
const offerController = require('../controllers/offerContoller')


admin_route.set('views','./views/admin')



admin_route.all('*',validate.checkAdmin)

admin_route.get('/dashboard',validate.requireAuth,adminController.loadDashboard)

admin_route.get('/',adminController.adminLogin)
admin_route.post('/',adminController.verifyLogin)
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

//Order
admin_route.get('/orderList',validate.requireAuth,adminController.orderList)
admin_route.get('/orderDetails',adminController.orderDetails)
admin_route.put('/orderStatus',adminController.changeStatus)
admin_route.put('/cancelOrder',adminController.cancelOrder)
admin_route.put('/returnOrder',adminController.returnOrder)

//Coupon

admin_route.get('/addCoupon',validate.requireAuth,couponController.loadCouponAdd)
admin_route.post('/addCoupon',couponController.addCoupon)
admin_route.get('/generate-coupon-code',validate.requireAuth,couponController.generateCouponCode)
admin_route.get('/couponList',validate.requireAuth,couponController.couponList)

admin_route.delete('/removeCoupon',couponController.removeCoupon)

//CategoryOffer
admin_route.get('/categoryOfferList',offerController.categoryOfferList)
admin_route.get("/createCategoryOffer",offerController.loadCreateCategoryOffer)
admin_route.post('/addCategoryOffer',offerController.createCategoryOffer)
admin_route.get('/editCategoryOffer',offerController.loadEditCategoryOffer)
admin_route.post('/editCategoryOffer',offerController.editCategoryOffer)
admin_route.delete('/deleteCategoryOffer',offerController.deleteCategoryOffer)
admin_route.get('/categoryOfferListPaginate',offerController.categoryPagination)

//Product Offer
admin_route.get("/addProductOffer",offerController.loadAddProductOffer)
admin_route.post('/addProductOffer',offerController.addProductOffer)
admin_route.get("/productOfferList",offerController.productOfferList)
admin_route.get('/productOfferListPaginate',offerController.productPagination)
admin_route.get('/editProductOffer',offerController.loadEditProductOffer)
admin_route.post('/editProductOffer',offerController.editProductOffer)
admin_route.delete('/deleteProductOffer',offerController.deleteProductOffer)

//sales Report
admin_route.get('/salesReport',validate.requireAuth,adminController.getSalesReport)
admin_route.post('/salesReport',adminController.postSalesReport)

module.exports= admin_route