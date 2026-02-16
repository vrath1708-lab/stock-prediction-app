const sentimentService = require('../services/sentimentService');

exports.getSentimentAnalysis = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const sentiment = await sentimentService.getSentimentAnalysis(symbol);
    res.json(sentiment);
  } catch (error) {
    next(error);
  }
};

exports.getNewsSentiment = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { limit = 10 } = req.query;
    const newsSentiment = await sentimentService.getNewsSentiment(symbol, limit);
    res.json(newsSentiment);
  } catch (error) {
    next(error);
  }
};

exports.getSocialMediaSentiment = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const socialSentiment = await sentimentService.getSocialMediaSentiment(symbol);
    res.json(socialSentiment);
  } catch (error) {
    next(error);
  }
};
