const Cart = require('../model/cartModel')
const Address = require('../model/addressModel')
const orderHelper = require('../helper/orderHelper')
const Order = require('../model/orderModel')
const mongoose = require('mongoose')
const {ObjectId} = mongoose.Types
const checkOut = async (req,res)=>{
    try {
        const user =  res.locals.user
        const total = await Cart.findOne({user:user.id})
        const address =await Address.findOne({user:user.id}).lean().exec()
       const cart = await Cart.aggregate([
        {
            $match:{user:user.id}
        },{
            $unwind:"$cartItems"
        },{
            $lookup:{
                from:"products",
                localField:"cartItems.productId",
                foreignField:"_id",
                as:"carted"
            }
        },{
            $project: {
              item: "$cartItems.productId",
              quantity: "$cartItems.quantity",
              total: "$cartItems.total",
              carted: { $arrayElemAt: ["$carted", 0] }
            }
          }
       ])
       if(address){
        res.render('checkOut',{address:address.addresses,cart,total})
       }else{
         
       res.render('checkOut',{address:[],cart,total})
       } 
    } catch (error) {
        console.error(error.message);
    }
}

const changePrimaryAddress = async (req,res)=>{
    try {
        const userId = res.locals.user._id
   const result = new ObjectId(req.body.addressRadio)
   const user   = await Address.findOne({user:userId.toString()})
   const addressIndex = user.addresses.findIndex((address)=>
    address._id.equals(result)
   )
   if(addressIndex == -1){
    throw new error('Address not found')
   }
   const removeAddress = user.addresses.splice(addressIndex,1)[0]
   user.addresses.unshift(removeAddress)

   const final = await Address.updateOne(
    {user:userId},
    {$set :{addresses:user.addresses}}
   )
   res.redirect('/checkOut')
    } catch (error) {
        console.error(error.message);
    }
}
const postCheckOut = async(req,res)=>{
    const userId = res.locals.user._id;
    const data =req.body
    try {
     const stock = await orderHelper.checkStock(userId)
    if(stock){
      if(data.paymentOption === "cod"){
        const updateStock = await orderHelper.updateStock(userId)
        const response = await orderHelper.placeOrder(data,userId.toString())
        await Cart.deleteOne({user:userId})
        res.json({ codStatus: true }); 
      }
    }else{
        await Cart.deleteOne({user:userId})
        res.json({ status: 'OrderFailed' });
    }
    } catch (error) {
      console.error(error.message); 
      res.json({ status: false, error: error.message });      
    }
}

const orderList = async(req,res)=>{
    try {
        const user = res.locals.user
        const orders = await Order.aggregate([
            {$match:{user:user._id}},
            {$unwind:'$orders'},
            { $sort: { "orders.createdAt": -1 } }
        ])
        res.render('profileOrder',{orders})
    } catch (error) {
        console.error(error.message);
    }
}

const orderDetails = async (req,res)=>{
    try {
      const user = res.locals.user
      const id = req.query.id
      orderHelper.findOrder(id, user._id).then((orders) => {
        const address = orders[0].shippingAddress
        const products = orders[0].productDetails 
        res.render('orderDetails',{orders,address,products})
      });      
    } catch (error) {
      console.log(error.message);
    }
  
  }
  const cancelOrder = async(req,res)=>{

    const orderId = req.body.orderId
    const status = req.body.status
    orderHelper.cancelOrder(orderId, status).then((response) => {
      res.send(response);
    });
  
  
  }
module.exports ={
    checkOut,
    changePrimaryAddress,
    postCheckOut,
    orderList,
    orderDetails,
    cancelOrder
}