import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import sequelize from "./db.js";
import "./models/index.js";
import routes from "./routes/index.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser()); // ✅ REQUIRED FOR JWT COOKIE
app.use("/api", routes);

await sequelize.authenticate();
await sequelize.sync({ alter: true });

app.listen(5001, () => {
  console.log("✅ Server running on port 5001");
});
