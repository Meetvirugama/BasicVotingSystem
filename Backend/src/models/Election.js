import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const isSqlite = sequelize.getDialect() === 'sqlite';

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

  /* 🗳️ DYNAMIC CANDIDATES 
     SQLite uses JSON (stored as TEXT), Postgres uses JSONB
  */
  candidates: {
    type: isSqlite ? DataTypes.JSON : DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
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
    type: isSqlite ? DataTypes.JSON : DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },

  status: {
    type: isSqlite ? DataTypes.STRING : DataTypes.ENUM("draft", "active", "closed"),
    defaultValue: "active"
  },

  created_by: {
    type: DataTypes.STRING, // Store Clerk ID (String)
    allowNull: false
  }

}, {
  tableName: "elections",
  timestamps: true
});

export default Election;
