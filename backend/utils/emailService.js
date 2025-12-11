import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Utility to generate a 6-digit OTP
export const generateOTP = () => {
    // Generates a random number between 100000 and 999999
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendVerificationEmail = async (user, otp) => { // <-- Now accepts the OTP
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Distributor App: Your One-Time Verification Code (OTP)',
    html: `
      <h2>Welcome, ${user.name}!</h2>
      <p>Thank you for registering. Please use the following One-Time Password (OTP) to verify your email address and activate your account:</p>
      <div style="font-size: 24px; font-weight: bold; color: #007bff; margin: 20px; padding: 10px; border: 1px solid #ccc; display: inline-block;">
        ${otp}
      </div>
      <p>This code expires in 10 minutes. Do not share it with anyone.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification OTP sent successfully to ${user.email}`);
  } catch (error) {
    console.error(`Error sending verification email to ${user.email}:`, error);
    throw new Error('Failed to send verification OTP.');
  }
};