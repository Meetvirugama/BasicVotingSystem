import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const FraudFlag = sequelize.define("FraudFlag", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  flagType: {
    type: DataTypes.ENUM("velocity_abuse", "duplicate_submission", "ip_mismatch", "ai_spam_detected", "manual_flag"),
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM("low", "medium", "high", "critical"),
    defaultValue: "medium"
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  resolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: "fraud_flags",
  timestamps: true
});

export default FraudFlag;
