const express = require('express');
const router = express.Router();
const sentimentController = require('../controllers/sentimentController');

// Sentiment Analysis
router.get('/:symbol', sentimentController.getSentimentAnalysis);
router.get('/:symbol/news', sentimentController.getNewsSentiment);
router.get('/:symbol/social', sentimentController.getSocialMediaSentiment);

module.exports = router;
