const express = require("express");
const router = express.Router();
const predictionController = require("../controllers/predictionController");
const predictionHistoryController = require("../controllers/predictionHistoryController");

// Existing prediction endpoints
router.get("/:symbol", predictionController.getStockPrediction);
router.post("/", predictionController.customPrediction);
router.get(
  "/portfolio/recommendations",
  predictionController.getPortfolioRecommendations,
);

// Prediction history & tracking endpoints
router.get("/history/all", predictionHistoryController.getPredictions);
router.get(
  "/history/symbol/:symbol",
  predictionHistoryController.getPredictionBySymbol,
);
router.get("/history/stats", predictionHistoryController.getStats);
router.post("/history", predictionHistoryController.createPrediction);
router.post(
  "/history/update-outcomes",
  predictionHistoryController.updateOutcomes,
);
router.post("/history/seed", predictionHistoryController.seedHistorical);

module.exports = router;
