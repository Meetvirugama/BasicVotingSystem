import sequelize from "./src/db.js";
import User from "./src/models/User.js";

async function drop() {
  try {
    await sequelize.authenticate();
    console.log("Connected. Dropping users table...");
    await sequelize.getQueryInterface().dropTable('users');
    console.log("Dropped users table.");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}
drop();
