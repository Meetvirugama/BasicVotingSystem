import sequelize from "../db.js";
import Election from "./Election.js";
import Vote from "./Vote.js";
import User from "./User.js";

User.hasMany(Vote, { foreignKey: "user_id" });
Vote.belongsTo(User, { foreignKey: "user_id" });

Election.hasMany(Vote, { foreignKey: "election_id" });
Vote.belongsTo(Election, { foreignKey: "election_id" });

export { sequelize, Election, Vote, User };
