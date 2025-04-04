import express from 'express';
import { login, register } from '../controllers/authControllers.js';
import { sendOtp, resetPassword } from "../controllers/authControllers.js";

const router = express.Router();

router.post('/signup', register);
router.post('/login', login);



// Route to send OTP to user email
router.post("/send-otp", sendOtp);

// Route to verify OTP and reset password
router.post("/reset-password", resetPassword);

export default router;
