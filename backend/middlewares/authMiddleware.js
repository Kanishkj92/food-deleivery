import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// ✅ Middleware: Authenticate User (Check if logged in)



export const authenticateUser = async (req, res, next) => {
    try {
      const token = req.header("Authorization")?.split(" ")[1];
  
      if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded Token:", decoded); // ✅ Debug: See token content
  
      req.user = await User.findById(decoded.userId).select("-password"); 
  
      if (!req.user) {
        return res.status(401).json({ message: "User n0t found", userId: decoded._id });
      }
  
      next();
    } catch (error) {
      console.error("Auth Error:", error.message); // ✅ Debug: Log error
      res.status(401).json({ message: "Invalid token" });
    }
  };
  

// ✅ Middleware: Authorize Role (Check user role)
export const authorizeRole = (role) => {
  return (req, res, next) => {
    if (req.user.userType !== role) {
      return res.status(403).json({ message: "Forbidden: You don't have permission" });
    }
    next(); // User has the correct role, proceed
  };
};
