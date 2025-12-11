import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import { verifyGst } from '../utils/gstVerifier.js';
import { sendVerificationEmail, generateOTP } from '../utils/emailService.js';

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    // Check: Prevent login if email is not verified 
    if (user.isVerified === false) {
        res.status(401); 
        throw new Error('Email not verified. Please verify using the OTP sent to your inbox.');
    }
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role, 
      business_name: user.business_name, 
      token: generateToken(user._id, user.role),
    });
  } else {
    res.status(401); 
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, business_name, gst_number } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400); 
    // MongoDB uniqueness check handles name/email errors below, but this is a quick email check.
    throw new Error('A user with that email already exists.');
  }
  
  const finalRole = ['retailer', 'admin'].includes(role) ? role : 'individual_buyer';
  let verifiedBusinessName = business_name;

  // --- GST Verification Check (MOCK) ---
  if (finalRole === 'retailer') {
      if (!business_name || !gst_number) {
          res.status(400);
          throw new Error('Retailer registration requires Business Name and GSTIN.');
      }
      
      try {
          const verificationResult = await verifyGst(gst_number);

          if (!verificationResult.verified) {
            res.status(400);
            throw new Error(`GSTIN Verification Failed: ${verificationResult.message}`);
          }
          verifiedBusinessName = verificationResult.legalName; 

      } catch (error) {
          res.status(400);
          throw new Error(error.message); 
      }
  }
  // --- End GST Verification Check ---

  try {
      // 1. Generate OTP and Expiration
      const otp = generateOTP();
      // Set OTP to expire 10 minutes from now
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); 

      // 2. Create the user, storing the OTP and Expiry
      const user = await User.create({
        name,
        email,
        password,
        role: finalRole,
        business_name: finalRole === 'retailer' ? verifiedBusinessName : undefined, 
        gst_number: finalRole === 'retailer' ? gst_number : undefined,
        isVerified: false,
        verificationOTP: otp, // <-- Store OTP
        otpExpires: otpExpires, // <-- Store Expiry
      });

      // 3. Send OTP Email
      if (user) {
          await sendVerificationEmail(user, otp); // <-- Send the generated OTP
      }

      // 4. Success Response (Redirect user to the OTP input screen)
      if (user) {
        res.status(201).json({ 
          message: `Registration successful. A 6-digit OTP has been sent to ${user.email}.`,
          userEmail: user.email, 
        });
      } else {
        res.status(400);
        throw new Error('Invalid user data');
      }
      
  } catch (error) {
      // Handle MongoDB Uniqueness Error (for 'name' field)
      if (error.code === 11000 && error.keyPattern && error.keyPattern.name === 1) {
          res.status(400);
          throw new Error('This username (Full Name) is already taken. Please choose another.');
      }
      // Handle MongoDB Uniqueness Error (for 'email' field)
      if (error.code === 11000 && error.keyPattern && error.keyPattern.email === 1) {
          res.status(400);
          throw new Error('A user with that email already exists.');
      }
      
      throw error; 
  }
});

// @desc    Verify user email using OTP
// @route   POST /api/users/verify-otp
// @access  Public
const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        res.status(400);
        throw new Error('Email and OTP are required.');
    }

    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('User not found.');
    }
    
    // 1. Check if user is already verified
    if (user.isVerified) {
        res.status(400);
        throw new Error('Email is already verified. Please proceed to login.');
    }
    
    // 2. Check if OTP matches and is not expired
    const isOtpValid = user.verificationOTP === otp;
    const isOtpExpired = user.otpExpires < new Date();

    if (!isOtpValid) {
        res.status(401);
        throw new Error('Invalid OTP.');
    }
    
    if (isOtpExpired) {
        res.status(401);
        // Clear old OTP fields
        user.verificationOTP = undefined;
        user.otpExpires = undefined;
        await user.save();
        throw new Error('OTP has expired. Please try registering again.');
    }

    // 3. Success: Mark user as verified and clear OTP fields
    user.isVerified = true;
    user.verificationOTP = undefined;
    user.otpExpires = undefined;
    await user.save();
    
    // 4. Respond with token so user can be immediately logged in
    res.status(200).json({
        message: 'Email successfully verified! You are now logged in.',
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        business_name: user.business_name, 
        token: generateToken(user._id, user.role), // <-- Log in the user immediately
    });
});

export { authUser, registerUser, verifyOTP };