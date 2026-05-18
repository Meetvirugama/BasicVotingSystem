import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const VerificationLog = sequelize.define("VerificationLog", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  methodUsed: {
    type: DataTypes.STRING,
    allowNull: false // e.g. 'time', 'ai', 'manual'
  },
  success: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  details: {
    type: DataTypes.JSON,
    allowNull: true // e.g. { "timeSpent": 45, "requiredTime": 30 }
  }
}, {
  tableName: "verification_logs",
  timestamps: true
});

export default VerificationLog;
