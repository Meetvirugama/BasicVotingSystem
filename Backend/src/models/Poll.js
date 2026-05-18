import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Poll = sequelize.define("Poll", {
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
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "active" // active, resolved, cancelled
  },
  creationCost: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  winningOptionId: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: "polls",
  timestamps: true
});

export default Poll;
