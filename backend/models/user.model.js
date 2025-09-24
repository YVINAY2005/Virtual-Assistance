import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
     email:{
        type:String,
        required:true,
        unique:true
    },
     password:{
        type:String,
        required:function() {
            return !this.googleId; // password required only if not OAuth
        }
    },
     googleId:{
        type:String,
    },
     assistanceName:{
        type:String,
    },
    assistanceImage:{
        type:String,
    },
    history:[
        {type:String}
    ]


},{timestamps:true})

const User=mongoose.model("User",userSchema)
export default User