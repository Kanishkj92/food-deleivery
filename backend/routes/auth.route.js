import express from 'express';
import { login, register } from '../controllers/authControllers.js';
import { sendOtp, resetPassword } from "../controllers/authControllers.js";

const router = express.Router();

router.post('/signup', register);
router.post('/login', login);
router.post("/send-otp", sendOtp);
router.post("/reset-password", resetPassword);

export default router;
