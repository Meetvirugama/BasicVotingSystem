import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const AuditLog = sequelize.define("AuditLog", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  admin_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  action: {
    type: DataTypes.STRING, // e.g. "CREATE_ELECTION", "CLOSE_POLL", "DELETE_ELECTION"
    allowNull: false
  },
  election_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  details: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  tableName: "audit_logs",
  timestamps: true
});

export default AuditLog;
