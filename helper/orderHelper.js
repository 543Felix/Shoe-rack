const Cart = require('../model/cartModel')
const Product = require('../model/productModel')
const Address = require('../model/addressModel')
const  Order = require('../model/orderModel')
const mongoose = require('mongoose')
const {ObjectId} = mongoose.Types
const placeOrder = (data,user)=>{
    try {
        return new Promise(async (resolve, reject) => {
            const productDetails = await Cart.aggregate([
              {
                $match: {
                  user: user
                },
              },
              {
                $unwind: "$cartItems",
              },
              {
                $project: {
                  item: "$cartItems.productId",
                  quantity: "$cartItems.quantity",
                },
              },
              {
                $lookup: {
                  from: "products",
                  localField: "item",
                  foreignField: "_id",
                  as: "productDetails",
                },
              },
              {
                $unwind: "$productDetails",
              }, {
                $project: {
                  productId: "$productDetails._id",
                  productName: "$productDetails.productName",
                  productPrice: "$productDetails.price",
                  quantity: "$quantity",
                  category: "$productDetails.category",
                  image: "$productDetails.images",
                },
              },
            ]);
            // console.log('place order',productDetails);
            const addressData = await Address.aggregate([
                {
                  $match: { user: user.toString() },
                },
                {
                  $unwind: "$addresses",
                }
                ,
                {
                  $match: { "addresses._id": new ObjectId(data.address) },
                },
                {
                  $project: { item: "$addresses" },
                },
              ]);
              let status,orderStatus
              if(data.paymentOption == 'cod'){
                (status = "Suceess"), (orderStatus = "Placed");
              }else {
                (status = "Pending"), (orderStatus = "Pending");
              }

              const orderData = {
                _id: new ObjectId(),
                name: addressData[0].item.name,
                paymentStatus: status,
                paymentMethod: data.paymentOption,
                productDetails: productDetails,
                shippingAddress: addressData[0],
                orderStatus: orderStatus,
                totalPrice: data.total,
                cancelStatus:'false',
                
                createdAt:new Date()
              };
              const order = await Order.findOne({ user:user  });
              if (order) {
                await Order.updateOne(
                  { user: user },
                  {
                    $push: { orders: orderData },
                  }
                ).then((response) => {
                  resolve(response);
                });
              } else {
                const newOrder = Order({
                  user: user,
                  orders: orderData,
                });
                await newOrder.save().then((response) => {
                    resolve(response);
                  });
                }
           
        });
        
        
            
    } catch (error) {
        console.log(error.message)
        
    }
}
const checkStock = async (userId)=>{
    const cart = await Cart.findOne({user:userId})
    const cartProducts = cart.cartItems
    for(const cartProduct of cartProducts){
        const productId = cartProduct.productId
        
        const product = await Product.findOne({_id:productId})
        if(product.stock< cartProduct.quantity){
            return false
        }
    }
    return true
}
const updateStock = async(userId)=>{
   const cart = await Cart.findOne({user:userId})
   const cartProducts =  cart.cartItems
   for( const cartProduct of cartProducts){
    const productId = cartProduct.productId
    const quantity = cartProduct.quantity

    const product = await Product.findOne({_id:productId}) 
    if(product.stock < quantity){
        return false
    }
    await Product.updateOne({_id:productId},
        {$inc:{stock:-quantity}}
        )
   }
}

const getOrderList = (page, limit) => {
    return new Promise((resolve, reject) => {
      Order.aggregate([
        { $unwind: "$orders" },
        { $group: { _id: null, count: { $sum: 1 } } },
      ])
        .then((totalOrders) => {
          const count = totalOrders.length > 0 ? totalOrders[0].count : 0;
          const totalPages = Math.ceil(count / limit);
          const skip = (page - 1) * limit;
  
          Order.aggregate([
            { $unwind: "$orders" },
            { $sort: { "orders.createdAt": -1 } },
            { $skip: skip },
            { $limit: limit },
          ])
          .then((orders) => {
            resolve({ orders, totalPages, page, limit });
          })
          .catch((error) => reject(error));
        })
        .catch((error) => reject(error));
    });
  };
  const findOrder  = (orderId, userId) => {
    try {
      return new Promise((resolve, reject) => {
        Order.aggregate([
          {
            $match: {
              "orders._id": new ObjectId(orderId),
              user: new ObjectId(userId),
            },
          },
          { $unwind: "$orders" },
        ]).then((response) => {
          let orders = response
            .filter((element) => {
              if (element.orders._id == orderId) {
                return true;
              }
              return false;
            })
            .map((element) => element.orders);
          console.log('');
          resolve(orders);
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  }
  const cancelOrder = async(orderId,status)=>{
    try {
      return new Promise((resolve, reject) => {
        Order.updateOne(
          { "orders._id": new ObjectId(orderId) },
          {
            $set: { "orders.$.orderStatus": status },
          }
        ).then((response) => {
          resolve(response);
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  }
module.exports ={
    checkStock,
    updateStock,
    placeOrder,
    getOrderList,
    findOrder,
    cancelOrder
}