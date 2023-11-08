const express = require('express')
const cookieParser = require('cookie-parser') 
const session = require('express-session')
const ejs = require('ejs')
const app = express()
const http = require('http')
const path = require('path')

// const server = http.createServer(app);
 
// const io = require("socket.io")(server);

// io.on("connection", (socket) => {
//   console.log("A new client has connected!");

//   // Listen for messages from the client.
//   socket.on("message", (data) => {
//     console.log("Received message:", data);

//     // Broadcast the message to all connected clients.
//     io.emit("message", data);
//   });

//   // Disconnect the socket when the client disconnects.
//   socket.on("disconnect", () => {
//     console.log("A client has disconnected.");
//   });
// });

const config = require('./config/mongoDb')
config.connectDb()





 app.set('view engine','ejs')
app.use(session({
    secret: 'your-secret-key', 
    resave: false,
    saveUninitialized: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,'public')))
app.use(cookieParser())
const userRoute = require('./routes/userRoute')
app.use('/',userRoute)
const adminRoute=require('./routes/adminRoute')
app.use('/admin',adminRoute)



app.listen(3001,()=>{
    console.log("server is running on the url http://localhost:3001");
})