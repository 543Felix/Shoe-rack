const Address = require('../model/addressModel')
const profileHelper = require('../helper/profileHelper')

const loadDashboard = async (req,res)=>{
    try {
      res.render('dashboard')  
    } catch (error) {
        
    }
}

const checkOutAddress = async(req,res)=>{
    try {
        const userId = res.locals.user._id
    const name = req.body.name
    const mobileNumber = req.body.mno
    const address = req.body.address
    const city = req.body.city
    const locality = req.body.locality
    const pincode = req.body.pincode;
    const state = req.body.state;

    const newAddress ={
      name:name,
      mobileNumber:mobileNumber,
      address : address,
      city : city,
      locality:locality,
      pincode:pincode,
      state:state
    }
    const updatedUser = await profileHelper.updateAddress(userId,newAddress)
    if(!updatedUser){
      await profileHelper.createAddress(userId,newAddress)
    }
    res.redirect('/checkOut')
    } catch (error) {
       console.error(error.message); 
    }
    
}

const profileAdress = async (req, res) => {
    try {
      let arr = []
      const user = res.locals.user;
      const address = await Address.find({user:user._id.toString()});
      if(address){
        const ad = address.forEach((x) => {
          return (arr = x.addresses);
        });
        res.render("profileAddress", { user, arr });
      }
      
    } catch (error) {
      console.log(error.message);
    }
  };
module.exports ={
    checkOutAddress,
    loadDashboard,
    profileAdress
}