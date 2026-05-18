import sequelize from "../db.js";
import Poll from "./Poll.js";
import PollOption from "./PollOption.js";
import Vote from "./Vote.js";
import User from "./User.js";
import Category from "./Category.js";
import Transaction from "./Transaction.js";
import AuditLog from "./AuditLog.js";
import Election from "./Election.js";

// New Task Models
import TaskCategory from "./TaskCategory.js";
import Task from "./Task.js";
import UserTaskHistory from "./UserTaskHistory.js";
import TaskSubmission from "./TaskSubmission.js";
import VerificationLog from "./VerificationLog.js";
import FraudFlag from "./FraudFlag.js";

// AI Autogen Models
import EventSource from "./EventSource.js";
import GeneratedPoll from "./GeneratedPoll.js";

// User <-> Poll (Creator)
User.hasMany(Poll, { foreignKey: "creator_id" });
Poll.belongsTo(User, { foreignKey: "creator_id", as: "creator" });

// Category <-> Poll
Category.hasMany(Poll, { foreignKey: "category_id" });
Poll.belongsTo(Category, { foreignKey: "category_id", as: "category" });

// Poll <-> PollOption
Poll.hasMany(PollOption, { foreignKey: "poll_id", as: "options" });
PollOption.belongsTo(Poll, { foreignKey: "poll_id" });

// User <-> Vote (Predictions)
User.hasMany(Vote, { foreignKey: "user_id" });
Vote.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Poll <-> Vote
Poll.hasMany(Vote, { foreignKey: "poll_id" });
Vote.belongsTo(Poll, { foreignKey: "poll_id" });

// PollOption <-> Vote
PollOption.hasMany(Vote, { foreignKey: "option_id" });
Vote.belongsTo(PollOption, { foreignKey: "option_id", as: "option" });

// User <-> Transaction
User.hasMany(Transaction, { foreignKey: "user_id" });
Transaction.belongsTo(User, { foreignKey: "user_id" });

// Election <-> Vote
Election.hasMany(Vote, { foreignKey: "election_id" });
Vote.belongsTo(Election, { foreignKey: "election_id" });

// Election <-> AuditLog
Election.hasMany(AuditLog, { foreignKey: "election_id" });
AuditLog.belongsTo(Election, { foreignKey: "election_id" });

// --- TASK SYSTEM RELATIONSHIPS ---

// TaskCategory <-> Task
TaskCategory.hasMany(Task, { foreignKey: "category_id" });
Task.belongsTo(TaskCategory, { foreignKey: "category_id", as: "category" });

// User <-> UserTaskHistory
User.hasMany(UserTaskHistory, { foreignKey: "user_id" });
UserTaskHistory.belongsTo(User, { foreignKey: "user_id" });

// Task <-> UserTaskHistory
Task.hasMany(UserTaskHistory, { foreignKey: "task_id" });
UserTaskHistory.belongsTo(Task, { foreignKey: "task_id", as: "task" });

// UserTaskHistory <-> TaskSubmission
UserTaskHistory.hasOne(TaskSubmission, { foreignKey: "history_id" });
TaskSubmission.belongsTo(UserTaskHistory, { foreignKey: "history_id" });

// UserTaskHistory <-> VerificationLog
UserTaskHistory.hasMany(VerificationLog, { foreignKey: "history_id" });
VerificationLog.belongsTo(UserTaskHistory, { foreignKey: "history_id" });

// User <-> FraudFlag
User.hasMany(FraudFlag, { foreignKey: "user_id" });
FraudFlag.belongsTo(User, { foreignKey: "user_id" });

export {
  sequelize, Poll, PollOption, Vote, User, Category, Transaction,
  AuditLog, Election,
  TaskCategory, Task, UserTaskHistory, TaskSubmission, VerificationLog, FraudFlag,
  EventSource, GeneratedPoll
};

