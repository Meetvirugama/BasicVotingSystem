import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const EventSource = sequelize.define("EventSource", {
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
  categoryName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  intervalMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 60
  },
  lastCrawledAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: "event_sources",
  timestamps: true
});

export default EventSource;
