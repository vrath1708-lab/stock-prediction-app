const express = require("express");
const router = express.Router();
const portfolioController = require("../controllers/portfolioController");
const authenticate = require("../middleware/auth");

router.get("/", authenticate, portfolioController.getPortfolio);
router.post("/buy", authenticate, portfolioController.buyStock);
router.post("/sell", authenticate, portfolioController.sellStock);

module.exports = router;
