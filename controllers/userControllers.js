const User = require('../model/userModel')
const Product =require('../model/productModel')
const Category = require('../model/categoryModel')
const bcrypt = require('bcrypt')
const express = require('express')
const jwt = require('jsonwebtoken')
const otpHelper = require('../helper/otpHelper')
const userHelper = require('../helper/userHelper')
require('dotenv').config()


const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: maxAge
  });
};


const user_controller = express.Router()
user_controller.use(express.json())


const userHomepage = async(req, res, next) => {
    try { 
        res.render('homepage')
    } catch (error) {
       console.error(error.message);
    }
};

const userLogin=async(req,res,next)=>{
    try {
        if(res.locals.user !==null){
            res.redirect('/')
        }else{
            res.render('login')
        } 
    } catch (error) {
       console.error(error.message); 
    }
}
const registration=async(req,res,next)=>{
try {
    if(res.locals.user !== null){
        res.redirect('/')
    }else{
        res.render('registration')
    }
} catch (error) {
    console.error(error.message);
}
}

    
const securePassword =  async(password)=>{
    try {
        const passwordHash = await bcrypt.hash(password,10)
            return passwordHash
    } catch (error) {
        console.error(error.message);
    }
}
const insertUser = async(req,res)=>{
    const email = req.body.email;
    const mobileNumber = req.body.mobile
    const existingUser = await User.findOne({email:email})

    if(existingUser){
      return res.render("registration",{message:"Email already exists"})
    }

    if(req.body.password!=req.body.confirmpassword){
        return res.render("registration", { message: "Password and Confirm Password must be same" });
    }

    await otpHelper.sendOtp(mobileNumber)
    try {
        req.session.userData = req.body;
        req.session.mobile = mobileNumber 
        res.render('verifyotp')
    } catch (error) {
        console.log(error.message);
       
 
    }
}

const verifyOtp = async(req,res)=>{
     const otp = req.body.otp
    try {
    const userData = req.session.userData;
     const verified = await otpHelper.verifyCode(userData.mobile,otp)

    if(verified){
    const spassword =await securePassword(userData.password)
        const user = new User({
            firstname:userData.firstName,
            lastname:userData.lastName,
            email:userData.email,
            mobile:userData.mobile,
            password:spassword,
        })
        const userDataSave = await user.save()
        if(userDataSave){
            const token = createToken(user._id);
            res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
            res.redirect('/')
        }else{
            res.render('registration',{message:"Registration Failed"})
        }
      }else{
        res.render('verifyotp',{ message: 'Wrong Otp' });

      }


    } catch (error) {
        console.log(error.message);
     
    }
}
const verifyLogin = async(req,res)=>{
   const data = req.body
   const result = await userHelper.verifyLogin(data)
   if(result.error){
    res.render('login')
    console.log(result.error);
   }else{
    const token = result.token;
      res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
      res.redirect('/');
   }
}

const logout = (req,res)=>{
    try {
        res.clearCookie('jwt')
        res.redirect('/login')
    } catch (error) {
        console.error(error.message);
    }
}
  
const shopPage = async(req,res)=>{
    try {
        const category = await Category.find({})

        const product = await Product.find({isProductListed:true}).populate('category')
        res.render('shop',{product,category})
    } catch (error) {
        console.error(error.message);
    }
}
    
const categoryPage = async(req,res)=>{
    try {
       const categoryId = req.query.id
       const category = await Category.find({})
       const page = parseInt(req.query.page)||1
       const limit = 3
       const skip = (page-1)*limit
       const totalProducts = await Product.countDocuments({ category:categoryId,$and: [{ isListed: true }, { isProductListed: true }]}); // Get the total number of products
        const totalPages = Math.ceil(totalProducts / limit);
       const sortQuery = req.query.sort||'default'
       let sortOption={}
       if(sortQuery ==='price_asc'|| sortQuery ==='default') {
        sortOption = {price:1}
       }else{
         sortOption ={price :-1}
       }
       const product = await Product.find({category:categoryId,$and:[{isCategoryListed:true},{isProductListed:true}]})
       .sort(sortOption)
       .populate('category')
       res.render('categoryShop',{product,category, currentPage :page ,totalPages,categoryId})
    } catch (error) {
      console.error(error.message);  
    }
}
module.exports = {
    userHomepage,
    userLogin,
    registration,
    insertUser,
    verifyOtp,
    verifyLogin,
    logout,
    shopPage,
    categoryPage
};
     