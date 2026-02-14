
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
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        process.env.VITE_FRONTEND_URL || "http://localhost:5173",
        "https://virtual-assistance-frontend.onrender.com"
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

const port=process.env.PORT || 8000
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
app.listen(port, () => {
    connectDb();
    console.log(`Server is running on port ${port}`);
});


    
