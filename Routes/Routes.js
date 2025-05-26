const express=require("express");
const router=express.Router();
const User=require("../Models/users");
const multer=require("multer");
const fs=require("fs");
const mongoose=require("mongoose");

//Route for rendering the add_users page
router.get("/add",(req,res)=>{
    res.render("add_users",{
        title:"User Page"
    })
});

//configure multer for file upload the logic goes here for file upload
const storage=multer.diskStorage({
    destination:"./uploads",
    filename:function(req,file,cb){
        cb(null,Date.now()+"_"+file.originalname);
    },
});

const upload=multer({storage}).single("image");

//Route for adding a user to the database 
router.post("/add",upload,async(req,res)=>{
    try{
        const user=new User({
            name:req.body.name,
            email:req.body.email,
            phone:req.body.phone,
            image:req.file.filename,
        })
        await user.save();
        req.session.message={
            type:"success",
            message:"User added successfully"
        }
        res.redirect("/");
    }
    catch(err)
    {
        console.error(err);
        req.session.message={
            type:"danger",
            message:"Failed to add user"
        };
        res.status(500).redirect("/");
    }
});

//route for rendering the index page
router.get("/",async (req,res)=>{
    try{
        const users=await User.find().exec(); //Fetch users from the database
        const message=req.session.message; //Retrieve the message from the session
        delete req.session.message; //removes the message from the session

        res.render("index",{
            title:"Home Page",
            users:users, //pass the users data to the view
            message:message, //pass the message to the view
        });
    }
    catch (err)
    {
        console.error(err);
        req.session.message={
            type:"danger",
            message : "Failed to fetch users"
        };
        res.redirect("/");
    }
});

//Delete user route functionality
router.get("/delete/id",(req,res)=>{
    let id=req.params.id;
    User.findOneAndDelete({_id:id}).exec().then((result)=>{
        if(result && result.image !==""){
            try{
                fs.unlinkSync("./upload/"+result.image);
                console.log("Image Deleted:"+result.image);
            }
            catch(err)
            {
                console.log("Error deleting image",err)
            }
        }
        req.session.message={
            type:"danger",
            message:"user deleted successfully",
        };
        res.redirect("/");
    })
    .catch((err)=>{
        res.json({message:err.message});
    })
})

//Route to edit a user page
router.get("/edit/:id",async (req,res)=>{
    try{
        const id = req.params.id;
        const user = await User.findById(id).exec();
        if(!user){
            return res.redirect("/");
        }
        res.render("edit_users",{
            title:"Edit User",
            user:user,
        });
    }
    catch(err){
        console.error(err);
        res.redirect("/")
    }
});


//to upload the image 
router.post("/update/:id",upload,async(req,res)=>{
    const id= req.params.id;
    const newImage =req.file ? req.file.filename : req.body.old_image;
    try{
        const updatedUser = await User.findByIdAndUpdate(
            id,{
                name : req.body.name,
                email:req.body.email,
                phone : req.body.phone,
                image : newImage,
            },
            {new:true}
        );

        if(!updatedUser){
            throw new Error("User not found");
        }

        //Remove the previous image file if a new image is uploaded
        if(req.file)
        {
            try{
                fs.unlinkSync(`./uploads/${req.body.old_image}`);
            }
            catch(err){
                console.log(err);
            }
        }
        req.session.message={
            type:"success",
            message:"User updated successfully",
        };
        res.redirect("/");
    }
    catch(err){
        console.error(err);
        req.session.message={
            type:"danger",
            message:err.message,
        };
        res.redirect("/");
    }
})

module.exports=router;