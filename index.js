const mongoose = require('mongoose')
mongoose.connect("mongodb://127.0.0.1:27017/shoerack") 



const express = require('express')
const path = require('path')
const app = express()
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,'public')))

const userRoute = require('./routes/userRoute')
app.use('/',userRoute)
const adminRoute=require('./routes/adminRoute')
app.use('/admin',adminRoute)



app.listen(3001,()=>{
    console.log("server is running on the url http://localhost:3001");
})