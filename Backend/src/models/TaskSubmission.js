import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const TaskSubmission = sequelize.define("TaskSubmission", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true // Only populated for "user_input" tasks
  },
  quizAnswers: {
    type: DataTypes.JSON, // e.g. { "q1": "A", "q2": "C" }
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM("pending_review", "approved", "rejected"),
    defaultValue: "pending_review"
  },
  reviewerNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: "task_submissions",
  timestamps: true
});

export default TaskSubmission;
