import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const UserTaskHistory = sequelize.define("UserTaskHistory", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  status: {
    type: DataTypes.ENUM("started", "pending_verification", "completed", "rejected"),
    defaultValue: "started"
  },
  startedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  verificationAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  clientFingerprint: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: "user_task_history",
  timestamps: true
});

export default UserTaskHistory;
