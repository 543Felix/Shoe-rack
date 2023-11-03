
const Category = require('../model/categoryModel')

const offerExists = async(categoryName,discountValidity,discountPercentage)=>{
    
    const categoryOfferExists = await Category.findOne({$and:[{categoryName:categoryName,discountValidity:{$gt: discountValidity}}]})
       console.log('createCategoryOffer',categoryOfferExists);
       if(categoryOfferExists ==null){
        await Category.findOneAndUpdate({categoryName:categoryName},
            {$set:
            {discountPercentage:discountPercentage,discountValidity:discountValidity}
           }
            )
            res.send({status:'true'})
        }else{
         res.send({status:"false"}) 
        }
}


module.exports ={
    offerExists,
}