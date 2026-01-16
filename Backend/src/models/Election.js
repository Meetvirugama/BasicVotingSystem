import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Election = sequelize.define("Election", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  title: {
    type: DataTypes.STRING,
    allowNull: false
  },

  TeamA: {
    type: DataTypes.STRING,
    allowNull: false,
    field: "team_a"
  },

  TeamB: {
    type: DataTypes.STRING,
    allowNull: false,
    field: "team_b"
  },

  CA: {
  type: DataTypes.INTEGER,
  allowNull: false,
  defaultValue: 0
  },

  CB: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },

  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },

  end_date: {
    type: DataTypes.DATE,
    allowNull: false
  },

  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },

  status: {
    type: DataTypes.ENUM("draft", "active", "closed"),
    defaultValue: "active"
  },

  created_by: {
    type: DataTypes.UUID,
    allowNull: false
  }

}, {
  tableName: "elections",
  timestamps: true
});

export default Election;
