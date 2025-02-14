const express=require("express")
const jwt=require("jsonwebtoken")
const User = require("../models/userModel")
require("dotenv").config()

const userAuthentication=async(req,res,next)=>{
    
    
    const {token} =req.cookies
    if(!token){
        throw new Error("User not authenticated")
    }
    const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY)
    req.user={
        email:decoded.email,
        id:decoded.id
    }
    const user=await User.findById(decoded.id)
    if(user.blocked)
    {
        throw new Error("User blocked")
    }
    next()
}
module.exports=userAuthentication