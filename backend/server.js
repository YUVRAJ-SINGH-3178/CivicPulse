const process = require("process");
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const path = require("path");

// Security middlewares
const { xssSanitizer } = require("./middlewares/xssSanitizer");
const {
  skipCSRFForRoutes,
  csrfErrorHandler,
} = require("./middlewares/csrfProtection");

const app = express();

// === Database Initialization ===
require("./config/mongo.js"); // MongoDB

// === Swagger Docs ===
const { swaggerUi, specs } = require("./config/swagger.js");

// === Middlewares ===
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Allow any localhost, any vercel.app, or your specific domains
      if (
        origin.startsWith("http://localhost") ||
        origin.endsWith(".vercel.app") ||
        origin.includes("civicpulse")
      ) {
        return callback(null, true);
      }

      return callback(new Error("CORS policy violation"), false);
    },
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// === Security Middlewares ===
app.use(xssSanitizer);

// CSRF Protection (skip for certain routes)
const csrfSkipRoutes = [
  "/api/contributors",  // Public read-only API
  "/api-docs",          // Swagger documentation
  "/api/auth/webhook",  // Webhooks
  "/api/issues",        // Public issue submissions (multipart — csurf can't read body before multer)
  "/api/profile",       // Profile creation/update
];
app.use(skipCSRFForRoutes(csrfSkipRoutes));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// === Rate Limiting ===
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// === Routes ===
const authRoutes = require("./routes/auth.js");
const issueRoutes = require("./routes/issues.js");
const profileRoutes = require("./routes/profileRoutes.js");
const contributionsRoutes = require("./routes/contributions.js");

// CSRF token endpoint
app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/contributors", contributionsRoutes);

// === Swagger API Docs ===
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// === Error Handlers ===
app.use(csrfErrorHandler);

const errorHandler = require("./middlewares/errorHandler.js");
app.use(errorHandler);

// === Start Server ===
// Vercel needs the app exported as a handler.
// Locally: use cluster for multi-core performance.
const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;

if (isVercel) {
  // Export app for Vercel to handle routing
  module.exports = app;
} else {
  const cluster = require("cluster");
  const os = require("os");
  const numCPUs = os.cpus().length;

  if (cluster.isPrimary) {
    console.log(`======================================`);
    console.log(`CivicPulse Backend Primary Process Started`);
    console.log(`Primary PID: ${process.pid}`);
    console.log(`=======================================`);
    console.log(`Forking server for ${numCPUs} CPU Cores...`);

    for (let i = 0; i < numCPUs; i++) cluster.fork();

    cluster.on("online", (worker) => {
      console.log(`Worker ${worker.process.pid} is online`);
    });

    cluster.on("exit", (worker, code, signal) => {
      console.error(`Worker ${worker.process.pid} died. Code: ${code}, Signal: ${signal}`);
      if (worker.exitedAfterDisconnect !== true) {
        console.log(`Restarting worker...`);
        cluster.fork();
      }
    });
  } else {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Worker running at http://localhost:${PORT}`));
  }
}
