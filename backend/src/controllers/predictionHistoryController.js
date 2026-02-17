const PredictionLog = require("../models/PredictionLog");
const {
  logPrediction,
  getAccuracyStats,
  updatePredictionOutcomes,
  seedHistoricalPredictions,
} = require("../services/predictionService");

exports.getPredictions = async (req, res) => {
  try {
    const { symbol, userId } = req.query;
    const query = {};

    if (symbol) query.symbol = symbol.toUpperCase();
    if (userId) query.userId = userId;

    const predictions = await PredictionLog.find(query).sort({
      entryDate: -1,
    });

    res.json(predictions);
  } catch (error) {
    console.error("Error fetching predictions:", error);
    res.status(500).json({ error: "Failed to fetch predictions" });
  }
};

exports.getPredictionBySymbol = async (req, res) => {
  try {
    const { symbol } = req.params;
    const predictions = await PredictionLog.find({
      symbol: symbol.toUpperCase(),
    }).sort({ entryDate: -1 });

    res.json(predictions);
  } catch (error) {
    console.error("Error fetching predictions:", error);
    res.status(500).json({ error: "Failed to fetch predictions" });
  }
};

exports.createPrediction = async (req, res) => {
  try {
    const { symbol, entryPrice, indicators } = req.body;
    const userId = req.user?.id || null;

    if (!symbol || !entryPrice || !indicators) {
      return res.status(400).json({
        error: "Missing required fields: symbol, entryPrice, indicators",
      });
    }

    const prediction = await logPrediction(
      symbol.toUpperCase(),
      entryPrice,
      indicators,
      userId,
    );

    res.status(201).json(prediction);
  } catch (error) {
    console.error("Error creating prediction:", error);
    res.status(500).json({ error: "Failed to create prediction" });
  }
};

exports.getStats = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const stats = await getAccuracyStats(userId);

    res.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

exports.updateOutcomes = async (req, res) => {
  try {
    await updatePredictionOutcomes();
    res.json({ message: "Prediction outcomes updated" });
  } catch (error) {
    console.error("Error updating outcomes:", error);
    res.status(500).json({ error: "Failed to update outcomes" });
  }
};

exports.seedHistorical = async (req, res) => {
  try {
    const { symbols } = req.body;
    const result = await seedHistoricalPredictions(symbols);
    res.json(result);
  } catch (error) {
    console.error("Error seeding historical predictions:", error);
    res.status(500).json({ error: "Failed to seed historical predictions" });
  }
};
