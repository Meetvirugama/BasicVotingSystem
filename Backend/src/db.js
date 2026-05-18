import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const useDemoDb = process.env.USE_DEMO_DB === "true";
const dbPassword = process.env.DB_PASS || process.env.DB_PASSWORD || null;

const sequelize = useDemoDb
  ? new Sequelize({
      dialect: "sqlite",
      storage: "./database.sqlite",
      logging: false,
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      dbPassword,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        dialect: "postgres",
        logging: false,
        dialectOptions: process.env.DB_HOST === "localhost" ? {} : {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        }
      }
    );

try {
  await sequelize.authenticate();
  console.log(useDemoDb ? "✅ Local Database Connected (SQLite)" : "✅ Production Database Connected (PostgreSQL)");
} catch (error) {
  console.error("❌ Database Connection Failed:", error);
}

export default sequelize;
