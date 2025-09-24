import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/db.js";
import cors from "cors"
import authRouter from "./routes/authRoute.js";
import cookieParser from "cookie-parser";
import userRouter from "./routes/userRoute.js";
import passport from "passport";
dotenv.config();



const app= express();

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))

const port=process.env.PORT ||5000
app.use(express.json())
app.use(cookieParser())
app.use(passport.initialize())

app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)

import geminiResponse from "./gemini.js";

app.get("/api/gemini", async (req, res) => {
    let prompt = req.query.prompt;
    let assistanceName = req.query.assistanceName || "Virtual Assistant";
    let userName = req.query.userName || "User";
    try {
        let data = await geminiResponse(prompt, assistanceName, userName);
        res.json({ result: data });
    } catch (error) {
        res.status(500).json({ error: "Gemini API error" });
    }
});

app.get("/", (req, res) => {
    res.send("api is working");
});
app.listen(port,()=>{
    connectDb()
    console.log(`Server is running on port ${process.env.PORT}`)
});


    
