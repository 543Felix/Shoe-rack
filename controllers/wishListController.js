const wishListModel = require('../model/wishlistModel')
const wishListHelper = require('../helper/wishListHelper')


const addToWhishlist = async(req,res)=>{
    const prodId = req.body.prodId
    const userId = res.locals.user._id
    wishListHelper.addToWhishlist(userId,prodId).then((response)=>{
        res.send(response)
    })

}

