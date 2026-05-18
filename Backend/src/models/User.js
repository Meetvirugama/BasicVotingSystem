import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true // Null for Google OAuth users
  },
  googleId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verificationCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.STRING, 
    defaultValue: "user"
  },
  reputationScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  level: {
    type: DataTypes.STRING,
    defaultValue: "Beginner" // Beginner, Active, Expert, Master
  },
  coinBalance: {
    type: DataTypes.DECIMAL(18, 2),
    defaultValue: 0.00
  },
  lastCheckIn: {
    type: DataTypes.DATE,
    allowNull: true
  },
  checkInStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: "users",
  timestamps: true
});

export default User;
