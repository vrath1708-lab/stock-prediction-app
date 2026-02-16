const predictionService = require('../services/predictionService');

exports.getStockPrediction = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const prediction = await predictionService.getStockPrediction(symbol);
    res.json(prediction);
  } catch (error) {
    next(error);
  }
};

exports.customPrediction = async (req, res, next) => {
  try {
    const parameters = req.body;
    const prediction = await predictionService.customPrediction(parameters);
    res.json(prediction);
  } catch (error) {
    next(error);
  }
};

exports.getPortfolioRecommendations = async (req, res, next) => {
  try {
    const recommendations = await predictionService.getPortfolioRecommendations();
    res.json(recommendations);
  } catch (error) {
    next(error);
  }
};
