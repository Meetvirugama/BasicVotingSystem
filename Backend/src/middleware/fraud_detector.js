import { FraudFlag, UserTaskHistory } from "../models/index.js";
import { Op } from "sequelize";

export const fraudDetector = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    // Check if user is already flagged
    const activeFlags = await FraudFlag.count({
      where: { user_id: userId, resolved: false, severity: { [Op.in]: ['high', 'critical'] } }
    });

    if (activeFlags > 0) {
      return res.status(403).json({ success: false, error: "Account flagged for suspicious activity. Task execution disabled." });
    }

    // Velocity Check: Has the user started > 5 tasks in the last minute?
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentStarts = await UserTaskHistory.count({
      where: {
        user_id: userId,
        startedAt: { [Op.gte]: oneMinuteAgo }
      }
    });

    if (recentStarts > 5) {
      // Create a FraudFlag
      await FraudFlag.create({
        user_id: userId,
        flagType: "velocity_abuse",
        severity: "medium",
        description: `User started ${recentStarts} tasks in under 60 seconds.`
      });
      return res.status(429).json({ success: false, error: "Rate limit exceeded. Please wait before starting more tasks." });
    }

    next();
  } catch (err) {
    console.error("FRAUD DETECTOR ERROR:", err);
    // Fail open or closed? We fail closed for security.
    return res.status(500).json({ success: false, error: "Security validation failed." });
  }
};
