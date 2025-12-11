import express from 'express';
const router = express.Router();
import { authUser, registerUser, verifyOTP } from '../controllers/userController.js'; // <-- Import new function

// Route for registering a new user (public)
router.route('/').post(registerUser);

// Route for authenticating/logging in a user (public)
router.post('/login', authUser);

// --- NEW ROUTE FOR OTP VERIFICATION ---
router.post('/verify-otp', verifyOTP);

export default router;