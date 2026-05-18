import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Task = sequelize.define("Task", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  taskType: {
    type: DataTypes.ENUM(
      "visit_link", "watch_content", "user_input", 
      "quiz", "social_activity", "referral", "daily_activity"
    ),
    allowNull: false
  },
  rewardCoins: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
    defaultValue: 0
  },
  difficultyLevel: {
    type: DataTypes.ENUM("easy", "medium", "hard", "expert"),
    defaultValue: "easy"
  },
  taskLink: {
    type: DataTypes.STRING,
    allowNull: true
  },
  verificationMethod: {
    type: DataTypes.ENUM("time", "click", "quiz", "input", "api", "manual", "ai"),
    defaultValue: "click"
  },
  verificationPayload: {
    type: DataTypes.JSON, // Stores quiz answers, min lengths, etc.
    allowNull: true
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM("active", "paused", "archived"),
    defaultValue: "active"
  },
  dailyLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 0 // 0 means no limit
  },
  totalCompletionLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 0 // 0 means unlimited
  },
  minimumTimeRequirement: {
    type: DataTypes.INTEGER,
    defaultValue: 0 // In seconds
  }
}, {
  tableName: "tasks",
  timestamps: true
});

export default Task;
