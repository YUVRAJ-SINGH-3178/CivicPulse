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

// Trust Render/Vercel reverse proxy for accurate IP detection (rate limiting)
app.set("trust proxy", 1);

// === Database Initialization ===
require("./config/mongo.js"); // MongoDB

// === Swagger Docs ===
const { swaggerUi, specs } = require("./config/swagger.js");

// === Middlewares ===
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
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

const csrfSkipRoutes = [
  "/api/contributors",
  "/api-docs",
  "/api/auth/webhook",
  "/api/issues",
  "/api/profile",
];
app.use(skipCSRFForRoutes(csrfSkipRoutes));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// === Rate Limiting ===
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// === Routes ===
const authRoutes = require("./routes/auth.js");
const issueRoutes = require("./routes/issues.js");
const profileRoutes = require("./routes/profileRoutes.js");
const contributionsRoutes = require("./routes/contributions.js");

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
const cluster = require("cluster");
const os = require("os");
const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`CivicPulse Backend Started | PID: ${process.pid} | Cores: ${numCPUs}`);
  for (let i = 0; i < numCPUs; i++) cluster.fork();
  cluster.on("exit", (worker) => {
    console.error(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Worker ${process.pid} running on port ${PORT}`));
}
