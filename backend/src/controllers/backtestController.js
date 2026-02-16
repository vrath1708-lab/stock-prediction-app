const backtestService = require("../services/backtestService");

exports.runSmaBacktest = async (req, res, next) => {
  try {
    const { symbol, fastPeriod, slowPeriod, initialCash, days } = req.body;
    const result = await backtestService.runSmaBacktest({
      symbol,
      fastPeriod,
      slowPeriod,
      initialCash,
      days,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};
