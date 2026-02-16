const express = require("express");
const router = express.Router();
const backtestController = require("../controllers/backtestController");

router.post("/", backtestController.runSmaBacktest);

module.exports = router;
