import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const register = async (req, res) => {
  try {
    const { name, email, password, userType, phone, gstNumber, darpanId } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      userType,
      phone,
      gstNumber: userType === "restaurant" ? gstNumber : null,
      darpanId: userType === "ngo" ? darpanId : null,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id, userType: user.userType }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};


const otpStorage = {};

// 🔹 Step 1: Send OTP to User Email
export const sendOtp = async (req, res) => {
  const { email } = req.body;
  console.log("Received email:", email);
  
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
  otpStorage[email] = otp; // Store OTP temporarily
  console.log("Generated OTP:", otp);

  // Configure Nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS, // Your email password
    },


  });

  // Send OTP email
  const mailOptions = {
    from: "kanishkj014@gmail.com",
    to: email,
    subject: "Password Reset OTP",
    text: `Your OTP for password reset is: ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    
    if (error){
      console.log(error);
      return res.status(500).json({ message: "Error sending OTP" });
    } 

    res.json({ message: "OTP sent successfully!" });
  });
};

// 🔹 Step 2: Verify OTP and Reset Password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!otpStorage[email] || otpStorage[email] != otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.findOneAndUpdate({ email }, { password: hashedPassword });

  delete otpStorage[email]; // Clear OTP after successful reset

  res.json({ message: "Password reset successful!" });
};