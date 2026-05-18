import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { sendVerificationEmail } from "../utils/email.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }

    let user = await User.findOne({ where: { email } });
    if (user) {
      if (!user.isVerified) {
        // Resend code if not verified
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationCode = code;
        await user.save();
        await sendVerificationEmail(user.email, code);
        return res.status(200).json({ success: true, message: "Verification code resent." });
      }
      return res.status(400).json({ success: false, error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationCode,
      isVerified: false
    });

    await sendVerificationEmail(email, verificationCode);

    res.status(201).json({ success: true, message: "Verification email sent." });
  } catch (err) {
    console.error("REGISTER ERROR:", err.message);
    res.status(500).json({ success: false, error: "Server error during registration." });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, error: "User already verified." });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ success: false, error: "Invalid verification code." });
    }

    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    const token = generateToken(user);
    
    res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    console.error("VERIFY ERROR:", err.message);
    res.status(500).json({ success: false, error: "Server error during verification." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, error: "Email not verified. Please verify first.", isVerified: false });
    }

    if (!user.password) {
      return res.status(400).json({ success: false, error: "Please log in with Google." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: "Invalid credentials." });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err.message);
    res.status(500).json({ success: false, error: "Server error during login." });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name } = payload;

    let user = await User.findOne({ where: { email } });

    if (!user) {
      // Create new verified user if not exists
      user = await User.create({
        name,
        email,
        googleId: sub,
        isVerified: true
      });
    } else if (!user.googleId) {
      // Link Google ID if email exists
      user.googleId = sub;
      user.isVerified = true;
      await user.save();
    }

    const jwtToken = generateToken(user);

    res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token: jwtToken
    });

  } catch (err) {
    console.error("GOOGLE AUTH ERROR:", err.message);
    res.status(401).json({ success: false, error: "Google Authentication failed" });
  }
};
