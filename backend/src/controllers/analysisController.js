const analysisService = require('../services/analysisService');

exports.getTechnicalAnalysis = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const analysis = await analysisService.getTechnicalAnalysis(symbol);
    res.json(analysis);
  } catch (error) {
    next(error);
  }
};

exports.getRSI = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { period = 14 } = req.query;
    const rsiData = await analysisService.getRSI(symbol, period);
    res.json(rsiData);
  } catch (error) {
    next(error);
  }
};

exports.getMACD = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const macdData = await analysisService.getMACD(symbol);
    res.json(macdData);
  } catch (error) {
    next(error);
  }
};

exports.getVolume = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const volumeData = await analysisService.getVolume(symbol);
    res.json(volumeData);
  } catch (error) {
    next(error);
  }
};

exports.getBollingerBands = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { period = 20 } = req.query;
    const bollingerData = await analysisService.getBollingerBands(symbol, period);
    res.json(bollingerData);
  } catch (error) {
    next(error);
  }
};
