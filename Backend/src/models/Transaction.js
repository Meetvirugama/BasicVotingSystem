import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Transaction = sequelize.define("Transaction", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  amount: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false // Positive for earn, Negative for spend
  },
  transactionType: {
    type: DataTypes.STRING, // 'check_in', 'prediction_stake', 'reward'
    allowNull: false
  },
  referenceId: {
    type: DataTypes.UUID, // Nullable, links to poll or task
    allowNull: true
  }
}, {
  tableName: "coin_transactions",
  timestamps: true,
  updatedAt: false // Transactions are immutable logs
});

export default Transaction;
