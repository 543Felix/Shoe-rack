const Cart = require('../model/cartModel')
const Product = require('../model/productModel')
const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types


const addToCart = async (productId, userId) => {
    const product = await Product.findOne({ _id: productId })
    const productObj = {
        productId: productId,
        quantity: 1,
        total: product.price
    }
    try {
        return new Promise(async (resolve, reject) => {
            const quantity = await Cart.aggregate([
                { $match: { user: userId.toString() } },
                { $unwind: "$cartItems" },
                { $match: { "cartItems.productId": new ObjectId(productId) } },
                { $project: { "cartItems.quantity": 1 } }
            ])
            Cart.findOne({ user: userId }).then(async (cart) => {
                if (cart) {
                    const productExist = await Cart.findOne({ user: userId, 'cartItems.productId': productId })
                    if (productExist) {
                        if (product.stock - quantity[0].cartItems.quantity > 0) {
                            Cart.updateOne(
                                { user: userId, "cartItems.productId": productId },
                                {
                                    $inc: {
                                        'cartItems.$.quantity': 1,
                                        'cartItems.$.total': product.price,
                                    },
                                    $set: {
                                        cartTotal: cart.cartTotal + product.price
                                    }
                                }
                            ).then((response) => {
                                resolve({ response, status: true })
                            })
                        } else {
                            resolve({ status: 'Out of Stock' })
                        }
                    } else {
                        if (product.stock > 0) {
                            Cart.updateOne(
                                { user: userId },
                                {
                                    $push: { cartItems: productObj },
                                    $inc: { cartTotal: product.price }
                                }
                            ).then((response) => {
                                resolve({ status: true })
                            })
                        } else {
                            resolve({ status: 'Out of Stock' })
                        }
                    }
                } else {
                    if (product.stock > 0) {

                        console.log('after added productfor 1st time to cart');
                        const newCart = await Cart({
                            user: userId,
                            cartItems: productObj,
                            cartTotal: product.price
                        })
                        await newCart.save().then((response) => {
                            resolve({ status: true })
                        })
                    } else {
                        resolve({ status: 'Out of Stock' })
                    }
                }
            })

        })
    } catch (error) {
        console.error(error.message);
    }
}

const getCartCount = async (userId) => {
    return new Promise((resolve, reject) => {
        let count = 0
        Cart.findOne({ user: userId }).then((cart) => {
            if (cart) {
                count = cart.cartItems.length
            }
            resolve(count)
        })
    })
}

const updateQuantity = async (data) => {
    const cartId = data.cartId;
    const proId = data.proId;
    const userId = data.userId;
    const count = data.count;
    const quantity = data.quantity;
    const product = await Product.findOne({ _id: proId })
    try {
        return new Promise(async (resolve, reject) => {
            if (quantity == 1 && count == -1) {
                Cart.findOneAndUpdate(
                    { _id: cartId, "cartItems.productId": proId },
                    {
                        $pull: { cartItems: { productId: proId } },
                        $inc: { cartTotal: product.price * count }
                    }
                ).then(() => {
                    resolve({ status: true })
                })

            } else {
                if (product.stock - quantity < 1 && count == 1) {
                    resolve({ status: 'Out of stock' })
                } else {
                    Cart.updateOne(
                        { _id: cartId, "cartItems.productId": proId },
                        {
                            $inc: {
                                "cartItems.$.quantity": count,
                                "cartItems.$.total": product.price * count,
                                cartTotal: product.price * count
                            }
                        }

                    ).then(() => {
                        Cart.findOne(
                            { _id: cartId, "cartItems.productId": proId },
                            { "cartItems.$": 1, cartTotal: 1 }
                        ).then(async (cart) => {
                            const newQuantity = cart.cartItems[0].quantity;
                            const newSubTotal = cart.cartItems[0].total;
                            const cartTotal = cart.cartTotal
                            resolve({ status: true, newQuantity: newQuantity, newSubTotal: newSubTotal, cartTotal: cartTotal });
                        })
                    })


                }
            }
        })

    } catch (error) {
        console.error(error.message);
    }

}
const deleteProduct = async (data) => {
    const cartId = data.cartId
    const proId = data.proId
    const product = await Product.findOne({ _id: proId })
    const cart = await Cart.findOne({ _id: cartId })
    try {
        const cartItem = cart.cartItems.find(item => item.productId.equals(proId))
        const quantityToRemove = cartItem.quantity
        return new Promise(async(resolve,reject)=>{
            Cart.updateOne(
                { _id: cartId, 'cartItems.productId': proId },
                {
                    $inc: { cartTotal: product.price * quantityToRemove * -1 },
                    $pull: { cartItems: { productId: proId } }
                }
            ).then(() => {
                resolve({ status: true })
            })
        })
        
    } catch (error) {
        console.error(error.message);
    }
}
module.exports = {
    addToCart,
    getCartCount,
    updateQuantity,
    deleteProduct
}