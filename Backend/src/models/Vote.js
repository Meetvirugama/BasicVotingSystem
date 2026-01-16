import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Vote = sequelize.define("Vote", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  election_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  team: {
    type: DataTypes.ENUM("A", "B"),
    allowNull: false
  }
}, {
  tableName: "votes",
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ["user_id", "election_id"]
    }
  ]
});

export default Vote;
