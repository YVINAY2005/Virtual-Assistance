import jwt from "jsonwebtoken";

const isAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies.token;
    
    console.log("=== isAuth Middleware ===");
    console.log("Authorization header:", authHeader ? "Present" : "Missing");
    console.log("Cookie token:", cookieToken ? "Present" : "Missing");
    console.log("All cookies:", req.cookies);
    
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : cookieToken;
    console.log("Final token used:", token ? `${token.substring(0, 20)}...` : "None");
    
    if (!token) {
      console.log("NO TOKEN FOUND - Returning 401");
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    console.log("Token verified for user:", req.userId);
    next();
  } catch (error) {
    console.error("isAuth error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default isAuth;
