import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
    // Make name unique (acting as username)
    name: { type: String, required: true, unique: true }, 
    
    // Make email unique and required
    email: { type: String, required: true, unique: true }, 
    
    // NEW FIELD: Tracks if the user has clicked the verification link
    isVerified: { type: Boolean, required: true, default: false }, 
    
    // NEW OTP FIELDS:
    verificationOTP: String, // Stores the 6-digit code
    otpExpires: Date, // Stores the expiration timestamp
    
    password: { type: String, required: true },
    
    // CRITICAL FIELD FOR RBAC:
    role: {
        type: String,
        enum: ['admin', 'retailer', 'individual_buyer'],
        default: 'individual_buyer',
        required: true
    },
    
    // Retailer-Specific Fields
    business_name: { type: String, required: function() { return this.role === 'retailer'; } },
    gst_number: String,

}, { timestamps: true });

// Custom Method to compare entered password with the hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Middleware: Hash the password before saving a new user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);
export default User;