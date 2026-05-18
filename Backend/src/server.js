import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import sequelize from "./db.js";
import "./models/index.js";
import routes from "./routes/index.js";

dotenv.config();

const app = express();

// ── Security Headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., curl, Postman, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  credentials: true
}));

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api", routes);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok", ts: new Date().toISOString() }));

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found." });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("UNHANDLED ERROR:", err);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === "production"
      ? "An unexpected error occurred."
      : err.message
  });
});

// ── Database + Server Start ───────────────────────────────────────────────────
const PORT = process.env.PORT || 5001;

(async () => {
  try {
    // db.js already called authenticate(); just sync here.
    await sequelize.sync();
    console.log("✅ Database synced.");
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();

