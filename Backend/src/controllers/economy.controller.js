import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import Poll from "../models/Poll.js";
import Vote from "../models/Vote.js";
import { Op } from "sequelize";
import sequelize from "../db.js";

export const getBalance = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    // Calculate dynamic stats
    const pollsCreatedCount = await Poll.count({ where: { creator_id: req.user.userId } });
    
    const sumResult = await Transaction.sum('amount', { 
      where: { 
        user_id: req.user.userId,
        amount: { [Op.gt]: 0 }
      } 
    });
    const totalEarnedVal = sumResult ? parseFloat(sumResult) : 0;

    const totalVotesCount = await Vote.count({ where: { user_id: req.user.userId } });

    // Calculate dynamic Win Rate based on resolved predictions
    const resolvedVotesCount = await Vote.count({
      include: [{
        model: Poll,
        required: true,
        where: { status: 'resolved' }
      }],
      where: { user_id: req.user.userId }
    });

    let winRatePercentage = 0;
    if (resolvedVotesCount > 0) {
      const correctVotesCount = await Vote.count({
        include: [{
          model: Poll,
          required: true,
          where: { 
            status: 'resolved',
            winningOptionId: sequelize.col('Vote.option_id')
          }
        }],
        where: { user_id: req.user.userId }
      });
      winRatePercentage = Math.round((correctVotesCount / resolvedVotesCount) * 100);
    } else {
      winRatePercentage = totalVotesCount > 0 ? 100 : 0; // Default placeholder
    }

    res.json({ 
      success: true, 
      balance: user.coinBalance, 
      level: user.level, 
      reputationScore: user.reputationScore,
      lastCheckIn: user.lastCheckIn,
      checkInStreak: user.checkInStreak,
      stats: {
        winRate: `${winRatePercentage}%`,
        pollsCreated: pollsCreatedCount.toString(),
        totalEarned: `+${totalEarnedVal}`
      }
    });
  } catch (err) {
    console.error("GET BALANCE ERROR:", err);
    res.status(500).json({ success: false, error: "Server error fetching balance" });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { user_id: req.user.userId },
      order: [["createdAt", "DESC"]],
      limit: 50
    });
    res.json({ success: true, transactions });
  } catch (err) {
    console.error("GET TRANSACTIONS ERROR:", err);
    res.status(500).json({ success: false, error: "Server error fetching transactions" });
  }
};

export const dailyCheckIn = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    const now = new Date();
    const lastCheckIn = user.lastCheckIn ? new Date(user.lastCheckIn) : null;
    
    let isNewDay = true;
    let isConsecutive = false;

    if (lastCheckIn) {
      const msInDay = 24 * 60 * 60 * 1000;
      const diffTime = Math.abs(now - lastCheckIn);
      const diffDays = Math.floor(diffTime / msInDay);

      if (now.toDateString() === lastCheckIn.toDateString()) {
        return res.status(400).json({ success: false, error: "Already checked in today!" });
      }

      if (diffDays <= 1) {
        isConsecutive = true;
      }
    }

    if (isConsecutive) {
      user.checkInStreak += 1;
    } else {
      user.checkInStreak = 1;
    }

    // Reward Logic: Day 1 = 10, Day 7 = 25, Day 30 = 100
    let reward = 10;
    if (user.checkInStreak >= 30) reward = 100;
    else if (user.checkInStreak >= 7) reward = 25;

    // Update User
    user.coinBalance = parseFloat(user.coinBalance) + reward;
    user.lastCheckIn = now;
    await user.save();

    // Log Transaction
    await Transaction.create({
      user_id: user.id,
      amount: reward,
      transactionType: "check_in"
    });

    res.json({ 
      success: true, 
      message: `Checked in successfully! Earned ${reward} coins.`, 
      streak: user.checkInStreak,
      balance: user.coinBalance 
    });

  } catch (err) {
    console.error("DAILY CHECK-IN ERROR:", err);
    res.status(500).json({ success: false, error: "Server error during check-in" });
  }
};
