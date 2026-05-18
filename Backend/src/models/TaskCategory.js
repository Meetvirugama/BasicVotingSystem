import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const TaskCategory = sequelize.define("TaskCategory", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM("active", "inactive"),
    defaultValue: "active"
  }
}, {
  tableName: "task_categories",
  timestamps: true
});

export default TaskCategory;
