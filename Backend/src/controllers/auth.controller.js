import jwt from "jsonwebtoken";
import { firebaseLogin } from "../services/auth.service.js";

export const login = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "Token missing"
      });
    }

    const user = await firebaseLogin(token);

    const jwtToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      token: jwtToken
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err.message);

    res.status(401).json({
      success: false,
      error: err.message || "Login failed"
    });
  }
};
