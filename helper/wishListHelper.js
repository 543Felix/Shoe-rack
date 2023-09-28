const { ObjectId } = require('mongodb')
const wishListModel = require('../model/wishlistModel')
const {objectId} = require('mongodb')
const wishlistModel = require('../model/wishlistModel')

const addToWhishlist = async(userId,prodId)=>{
    try {
        return new Promise((resolve,reject)=>{
          wishListModel.findOne({user : new ObjectId(userId)}).then((userWishlist)=>{
            if(userWishlist){
                let productExist = userWishlist.wishList.findIndex({productId: new objectId(prodId)})
                if(productExist !=-1){
                    resolve({status:false})
                }else{
                    wishlistModel.updateOne
                }
            }else{
                let wishListData = {
                    user: new objectId(userId),
                    wishList :[{productId: new objectId(prodId)}]
                }
                let newWishlist = new wishListModel(wishListData)
                newWishlist.save()
                .then(()=>{
                    resolve({status:true})
                })
                .catch((err)=>{
                    reject(err)
                })
            }
          })
        })
    } catch (error) {
        console.error();
    }
}