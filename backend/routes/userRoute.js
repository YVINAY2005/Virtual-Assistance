import express from "express"
import { signUp ,logOut,login} from "../controller/auth.controller.js"
import { getCurrentUser } from "../controller/user.controller.js"
import isAuth from "../middleware/isAuth.js"



const userRouter=express.Router()
userRouter.get("/current",isAuth,getCurrentUser)

export default userRouter