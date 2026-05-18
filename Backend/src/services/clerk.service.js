import User from "../models/User.js";

export const syncClerkUser = async (clerkId, email, name) => {
  // 🛡️ ADMIN OVERRIDE
  const isAdmin = email === "meet56963@gmail.com";
  const role = isAdmin ? "admin" : "voter";

  let user = await User.findOne({
    where: { email }
  });

  if (!user) {
    user = await User.create({
      id: clerkId,
      name: name || "User",
      email: email,
      role: role
    });
  } else {
     // Update role if override applies, and ensure ID is synced
     await user.update({ 
       id: clerkId,
       role: role 
     });
  }

  return user;
};
