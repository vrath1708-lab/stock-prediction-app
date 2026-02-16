const express = require("express");
const router = express.Router();
const stockController = require("../controllers/stockController");

// Get top stocks with predictions
router.get("/top", stockController.getTopStocks);

// Search stocks by symbol or name
router.get("/search", stockController.searchSymbols);

// Get stock by symbol
router.get("/:symbol", stockController.getStockBySymbol);

// Get historical data
router.get("/:symbol/historical", stockController.getHistoricalData);

module.exports = router;
