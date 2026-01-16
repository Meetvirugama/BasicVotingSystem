import User from "../models/User.js";

const adminOnly = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    next();
  } catch (err) {
    console.error("Admin check error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export default adminOnly;
