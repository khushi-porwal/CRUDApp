require("dotenv").config();
const express=require("express");
const mongoose=require("mongoose");
const session=require("express-session");
const app=express();
const PORT=process.env.PORT || 5500;

//Middleware
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use(session({
    secret:"complex-secret-key"
})
);

//Database connection
mongoose.connect(process.env.DB_URI,{
}).then(()=>console.log("connected to the database"))
.catch((error)=>console.error(error));

//set template engine
app.set("view engine","ejs");

//Routes
const routes = require("./Routes/Routes")
app.use("/",routes);
console.log("hello")
//Error handling middleware
app.use((err,req,res,next)=>{
    console.error(err.stack);
    res.status(500).send("Internal Server Error");
})

//logic for image icon
app.use(express.static("uploads"));

//start the server
app.listen(PORT,()=>{
    console.log(`server is running on ${PORT}`)
    
})
