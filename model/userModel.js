const mongoose = require("mongoose")
//jwt if needed
const userSchema  = new mongoose.Schema({
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    email: {
        type: String,
        required: true,
    },
    mobile:{
        type: Number,
        required:true,
    },
    password:{
        type:String,
        required:true
    },
    is_blocked:{
        type:Number,
        required:true,
        default:false
    },
    verified:{
        type:Number,
        required:true,
        default:false
    }
})


module.exports = mongoose.model('User',userSchema)