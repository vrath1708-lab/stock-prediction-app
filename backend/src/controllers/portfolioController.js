const portfolioService = require("../services/portfolioService");

exports.getPortfolio = async (req, res, next) => {
  try {
    const data = await portfolioService.getPortfolio(req.user.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.buyStock = async (req, res, next) => {
  try {
    const { symbol, shares } = req.body;
    const data = await portfolioService.buyStock(req.user.id, symbol, shares);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.sellStock = async (req, res, next) => {
  try {
    const { symbol, shares } = req.body;
    const data = await portfolioService.sellStock(req.user.id, symbol, shares);
    res.json(data);
  } catch (error) {
    next(error);
  }
};
