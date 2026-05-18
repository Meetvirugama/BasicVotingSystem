import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const GeneratedPoll = sequelize.define("GeneratedPoll", {
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
    allowNull: true
  },
  categoryName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  options: {
    type: DataTypes.JSON,
    allowNull: false
  },
  priorityScore: {
    type: DataTypes.FLOAT,
    defaultValue: 50.0
  },
  confidenceScore: {
    type: DataTypes.FLOAT,
    defaultValue: 0.8
  },
  moderationStatus: {
    type: DataTypes.STRING,
    defaultValue: "pending_review"
  },
  duplicateRisk: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: "generated_polls",
  timestamps: true
});

export default GeneratedPoll;
