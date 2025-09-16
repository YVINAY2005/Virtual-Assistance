import express from "express"
import { signUp ,logOut,login} from "../controller/auth.controller.js"



const authRouter=express.Router()

authRouter.post("/signup",signUp)
authRouter.post("/signin",login)
authRouter.get("/logout",logOut)

export default authRouter