import admin from "../firebaseAdmin.js";
import User from "../models/User.js";

export const firebaseLogin = async (token) => {
  const decoded = await admin.auth().verifyIdToken(token);

  if (!decoded.email_verified) {
    throw new Error("Email not verified");
  }

  let user = await User.findOne({
    where: { email: decoded.email }
  });

  if (!user) {
    user = await User.create({
      name: decoded.name || "User",
      email: decoded.email,
      mobile: decoded.phone_number || null
    });
  }

  return user;
};
