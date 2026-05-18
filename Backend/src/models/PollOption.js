import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const PollOption = sequelize.define("PollOption", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  totalStaked: {
    type: DataTypes.DECIMAL(18, 2),
    defaultValue: 0.00
  }
}, {
  tableName: "poll_options",
  timestamps: true
});

export default PollOption;
