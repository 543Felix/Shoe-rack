const Order = require('../model/orderModel')
const User = require('../model/userModel')
const mongoose = require('mongoose')
const {ObjectId} = mongoose.Types
const findOrder  = async(orderId) => {
    try {
      return new Promise((resolve, reject) => {
        Order.aggregate([
          {
            $match: {
              "orders._id": new ObjectId(orderId)
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
  
          resolve(orders);
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  }

const changeOrderStatus = (orderId, status) => {
    try {
      return new Promise((resolve, reject) => {
        Order.updateOne(
          { "orders._id": new ObjectId(orderId) },
          {
            $set: { "orders.$.orderStatus": status },
          }
        ).then((response) => {
          resolve({status:true,orderStatus:status});
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  const cancelOrder = (orderId,userId, status) => {
    try {

      return new Promise(async (resolve, reject) => {
        Order.findOne({ "orders._id": new ObjectId(orderId) }).then(async(orders) => {
          const order = orders.orders.find((order) => order._id == orderId);
          if(order.paymentMethod=='cod'){
  
          if (status == 'Cancel Accepted') {
            Order.updateOne(
              { "orders._id": new ObjectId(orderId) },
              {
                $set: {
                  "orders.$.cancelStatus": status,
                  "orders.$.orderStatus": status,
                  "orders.$.paymentStatus": "No Refund"
                }
              }
            )
            
            .then(async(response) => {
              await addToStock(orderId,userId)
              resolve(response);
            });
          }else if(status == 'Cancel Declined'){
            Order.updateOne(
              { "orders._id": new ObjectId(orderId) },
              {
                $set: {
                  "orders.$.cancelStatus": status,
                  "orders.$.orderStatus": status,
                  "orders.$.paymentStatus": "No Refund"
                }
              }
            ).then(async(response) => {
              resolve(response);
            });
            

          }
        }
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  const returnOrder = async (orderId,userId,status) => {
    try {
      return new Promise(async (resolve, reject) => {
        Order.findOne({ "orders._id": new ObjectId(orderId) }).then((orders) => {
          const order = orders.orders.find((order) => order._id == orderId);
       
          if(order.paymentMethod == 'cod'){
          if (status == 'Return Declined') {
            Order.updateOne(
              { "orders._id": new ObjectId(orderId) },
              {
                $set: {
                  "orders.$.cancelStatus": status,
                  "orders.$.orderStatus": status,
                  "orders.$.paymentStatus": "No Refund"
                } 
              }
            ).then((response) => {
              resolve(response);
            });
          }else if(status == 'Return Accepted'){
            Order.updateOne(
              { "orders._id": new ObjectId(orderId) },
              {
                $set: {
                  "orders.$.cancelStatus": status,
                  "orders.$.orderStatus": status,
                  "orders.$.paymentStatus": "Refund Credited to Wallet"
                }
              }
            ).then(async (response) => {
              const user = await User.findOne({ _id: userId});
              user.wallet += parseInt(order.totalPrice);
              await user.save();
              const walletTransaction = {
                date:new Date(),
                type:"Credit",
                amount:order.totalPrice,
              }
              const walletupdated = await User.updateOne(
                { _id: userId },
                {
                  $push: { walletTransaction: walletTransaction },
                }
              )
              resolve(response);
            });

          }
        }
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  module.exports ={
    findOrder,
    changeOrderStatus,
    cancelOrder,
    returnOrder
  }