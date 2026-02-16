const stockService = require("../services/stockService");

exports.getTopStocks = async (req, res, next) => {
  try {
    const topStocks = await stockService.getTopStocks();
    res.json(topStocks);
  } catch (error) {
    next(error);
  }
};

exports.getStockBySymbol = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const stock = await stockService.getStockBySymbol(symbol);
    res.json(stock);
  } catch (error) {
    next(error);
  }
};

exports.getHistoricalData = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { days = 30 } = req.query;
    const historicalData = await stockService.getHistoricalData(symbol, days);
    res.json(historicalData);
  } catch (error) {
    next(error);
  }
};

exports.searchSymbols = async (req, res, next) => {
  try {
    const { query, page, pageSize, region, type, currency } = req.query;
    const results = await stockService.searchSymbols(query, {
      page,
      pageSize,
      region,
      type,
      currency,
    });
    res.json(results);
  } catch (error) {
    next(error);
  }
};
