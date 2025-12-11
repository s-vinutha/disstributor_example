// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

// Middleware to protect routes (checks for a valid token)
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 1. Get token from header (Format: 'Bearer <token>')
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Attach user data (without password) to the request object
      req.user = await User.findById(decoded.id).select('-password');
      req.role = decoded.role; // Attach the role directly
      
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Middleware to authorize users by role
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if the user's role (req.role, attached by the 'protect' middleware)
    // is included in the list of allowed roles passed to the function.
    if (!roles.includes(req.role)) {
      res.status(403); // Forbidden
      throw new Error(`User role ${req.role} is not authorized to access this route`);
    }
    next();
  };
};

export { protect, authorize };