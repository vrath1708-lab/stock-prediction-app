const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');

// Technical Analysis
router.get('/technical/:symbol', analysisController.getTechnicalAnalysis);
router.get('/rsi/:symbol', analysisController.getRSI);
router.get('/macd/:symbol', analysisController.getMACD);
router.get('/volume/:symbol', analysisController.getVolume);
router.get('/bollinger/:symbol', analysisController.getBollingerBands);

module.exports = router;
