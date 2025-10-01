import express from "express"
import { signUp ,logOut,login} from "../controller/auth.controller.js"
import { askToAssistant, getCurrentUser, UpdateAssistant, confirmShutdown } from "../controller/user.controller.js"
import isAuth from "../middleware/isAuth.js"
import upload from "../middleware/multer.js"



const userRouter=express.Router()
userRouter.get("/current",isAuth,getCurrentUser)
userRouter.post("/update",isAuth,upload.single('assistantImage'),UpdateAssistant)
userRouter.post("/asktoassistance",isAuth,askToAssistant)
userRouter.post("/shutdown-confirm",isAuth,confirmShutdown)
userRouter.post("/shutdown",isAuth,confirmShutdown)
export default userRouter
