// backend/utils/generateToken.js
import jwt from 'jsonwebtoken';

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role }, // Payload: user ID and their role
    process.env.JWT_SECRET,
    { expiresIn: '30d' } // Token expires in 30 days
  );
};

export default generateToken;