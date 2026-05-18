import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Category = sequelize.define("Category", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  iconUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  minCoinRequirement: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  }
}, {
  tableName: "categories",
  timestamps: true
});

export default Category;
