import genToken from "../config/token.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";

//* Signup
export const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const ExistEmail = await User.findOne({ email });
    if (ExistEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      password: hashedPassword,
      email,
      assistanceName: "Assistant",
      assistanceImage: "https://example.com/default-assistant-image.png",
    });

    const Token = await genToken(user._id);
    console.log("Signup Token:", Token);

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie("token", Token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction, // true on production (HTTPS), false on localhost (HTTP)
    });

    // Add a flag to indicate first time user for frontend redirect
    return res.status(201).json({ ...user.toObject(), token: Token, isFirstTimeUser: true });
  } catch (error) {
    return res.status(500).json({ message: `sign up error ${error}` });
  }
};

//* Login
export const login = async (req, res) => {
  try {
    console.log("Login request body:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      console.log("Missing email or password");
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(400).json({ message: "Email does not exist" });
    }

    console.log("User found:", user.email, "Comparing passwords...");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for user:", email);
      return res.status(400).json({ message: "Incorrect Password" });
    }

    const Token = await genToken(user._id);
    console.log("Login Token:", Token);

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie("token", Token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction, // true on production (HTTPS), false on localhost (HTTP)
    });

    console.log("Login successful for user:", email);
    return res.status(200).json({ ...user.toObject(), token: Token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: `login error ${error}` });
  }
};

//* Logout
export const logOut = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logout successfully" });
  } catch (error) {
    return res.status(500).json({ message: `logout error ${error}` });
  }
};
