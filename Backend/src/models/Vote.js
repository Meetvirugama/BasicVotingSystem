import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Vote = sequelize.define("Vote", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  stakeAmount: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false
  },
  lockedOdds: {
    type: DataTypes.DECIMAL(6, 4),
    allowNull: false
  }
}, {
  tableName: "votes",
  timestamps: true,
  updatedAt: false // Votes are immutable
});

export default Vote;
