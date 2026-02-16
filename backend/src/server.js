require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const stockRoutes = require("./routes/stocks");
const analysisRoutes = require("./routes/analysis");
const sentimentRoutes = require("./routes/sentiment");
const predictionRoutes = require("./routes/predictions");
const newsRoutes = require("./routes/news");
const authRoutes = require("./routes/auth");
const portfolioRoutes = require("./routes/portfolio");
const backtestRoutes = require("./routes/backtest");
const alertRoutes = require("./routes/alerts");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/stocks", stockRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/sentiment", sentimentRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/backtest", backtestRoutes);
app.use("/api/alerts", alertRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "API is running", timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Stock Prediction API running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });

module.exports = app;
