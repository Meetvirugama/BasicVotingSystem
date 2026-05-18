import User from "../models/User.js";
import * as userService from "../services/user.service.js";

export async function getProfile(req, res) {
  try {
    const user = await userService.getUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

export async function updateProfile(req, res) {
  try {
    const updatedUser = await userService.updateUserProfile(
      req.user.userId,
      req.body
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database update failed" });
  }
}

export const getLeaderboard = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'reputationScore', 'level', 'coinBalance'],
      order: [['reputationScore', 'DESC']],
      limit: 50
    });
    // map name to username for frontend compatibility
    const mapped = users.map(u => ({
      ...u.toJSON(),
      username: u.name
    }));
    res.json({ success: true, leaderboard: mapped });
  } catch (err) {
    console.error("GET LEADERBOARD ERROR:", err);
    res.status(500).json({ success: false, error: "Server error fetching leaderboard" });
  }
};

