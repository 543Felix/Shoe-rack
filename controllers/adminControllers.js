const admin = require('../model/adminModel')
const jwt = require('jsonwebtoken')
const User = require ('../model/userModel')

const maxAge = 3*24*60*60

const createToken = (id) => {
   return jwt.sign({id},process.env.JWT_SECRET_KEY,{
    expiresIn: maxAge
   })
  };
const adminRegistration=async(req,res,next)=>{
    try {
       res.render('adminRegistration') 
    } catch (error) {
       console.error(error); 
    }
}
 
const adminLogin = async(req,res,next)=>{
    try {
        if(res.locals.admin !==null && res.locals.admin !== 'undefined'){
          res.redirect('/admin/adminHome')
        }else{
            res.render('login')
        }
    } catch (error) {
        console.error(error);
    }
}

const adminHome = async(req,res)=>{
    try {
      res.render('adminHome')  
    } catch (error) {
       console.error(error.message); 
    }
} 
// const securePassword =  async(password)=>{
//     try {
//         const passwordHash = await bcrypt.hash(password,10)
//             return passwordHash
//     } catch (error) {
//         console.error(error.message);
//     }
// }
const verifyLogin = async (req,res)=>{
    try {
       const name = req.body.name
       const password = req.body.password
       const adminData = await admin.findOne({name:name})
       if(adminData){
         if(password===adminData.password){
            const token = createToken(adminData._id)
            res.cookie('jwtAdmin',token,{ httpOnly: true, maxAge: maxAge * 1000 })
            res.redirect('/admin/adminHome')
         }else{
            res.render('login',{message:'Please verify your password'})
         }
       }else{
        res.render('login',{message:'Please verify your name'})
       }
    } catch (error) {
        console.error(error.message);
    }
}
 
const blockUser = async(req,res)=>{
    try {
    const id = req.body.userId
    await User.findByIdAndUpdate({_id:id},{$set:{is_blocked:true}})
    res.send({status:true})
    } catch (error) {
      console.error(error.message);  
    }
}

const unBlockUser = async(req,res)=>{
    try {
      const id = req.body.userId
      await User.findByIdAndUpdate({_id:id},{$set:{is_blocked:false}}) 
      res.send({status:true}) 
    } catch (error) {
      console.error(error.message);  
    }
}
const loadUsers = async(req,res)=>{
    try{
        const userData = await User.find()
        res.render('userList',{user:userData})
    }catch (error){
        console.error(error.message);
    }
}

const logOut = async(req,res)=>{
    try {
        res.clearCookie('jwtAdmin')
       res.render('login') 
    } catch (error) {
        console.error(error.message);
    }
}
module.exports={
    adminRegistration,
    adminLogin,
    adminHome,
    verifyLogin,
    loadUsers,
    blockUser,
    unBlockUser,
    logOut
}