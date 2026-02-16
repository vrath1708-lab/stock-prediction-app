const newsService = require("../services/newsService");

exports.getNews = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { limit = 8 } = req.query;
    const news = await newsService.getNewsWithSentiment(symbol, limit);
    res.json(news);
  } catch (error) {
    next(error);
  }
};
