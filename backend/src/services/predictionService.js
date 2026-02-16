exports.getStockPrediction = async (symbol) => {
  try {
    return {
      symbol,
      prediction: "BUY",
      confidence: 0.823,
      targetPrice: 115.5,
      timeFrame: "30 days",
      factors: {
        technical: { weight: 0.4, score: 0.8 },
        sentiment: { weight: 0.3, score: 0.85 },
        volume: { weight: 0.2, score: 0.75 },
        momentum: { weight: 0.1, score: 0.88 },
      },
      reasoning: [
        "RSI indicates uptrend potential",
        "MACD shows bullish signals",
        "Positive news sentiment",
        "Above-average trading volume",
      ],
      risks: ["Market volatility", "Potential profit taking near resistance"],
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw error;
  }
};

exports.customPrediction = async (parameters) => {
  try {
    const { symbol, rsi, macd, volume, sentiment } = parameters;

    // Calculate composite score
    let compositeScore = 0;
    let factors = [];

    if (rsi) {
      compositeScore += rsi > 70 ? -0.1 : rsi < 30 ? 0.1 : 0;
      factors.push(`RSI: ${rsi}`);
    }

    if (macd) {
      compositeScore += macd > 0 ? 0.2 : -0.2;
      factors.push(`MACD: ${macd > 0 ? "Bullish" : "Bearish"}`);
    }

    if (volume) {
      compositeScore += volume > 0 ? 0.15 : -0.15;
      factors.push(`Volume: ${volume > 0 ? "Above Average" : "Below Average"}`);
    }

    if (sentiment) {
      compositeScore += sentiment * 0.2;
      factors.push(`Sentiment Score: ${(sentiment * 100).toFixed(1)}%`);
    }

    const normalizedScore = Math.min(1, Math.max(-1, compositeScore));
    const prediction =
      normalizedScore > 0.3 ? "BUY" : normalizedScore < -0.3 ? "SELL" : "HOLD";

    return {
      symbol,
      prediction,
      confidence: Math.abs(normalizedScore),
      factors,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw error;
  }
};

exports.getPortfolioRecommendations = async () => {
  try {
    return {
      recommendations: [
        {
          symbol: "AAPL",
          action: "BUY",
          confidence: 0.82,
          reason: "Strong technical signals with positive sentiment",
        },
        {
          symbol: "MSFT",
          action: "HOLD",
          confidence: 0.68,
          reason: "Mixed signals, maintain current position",
        },
        {
          symbol: "TSLA",
          action: "SELL",
          confidence: 0.72,
          reason: "Negative sentiment and waning momentum",
        },
      ],
      summary: "Portfolio weighted towards tech sector with buy opportunities",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw error;
  }
};

// Prediction Logging & Tracking
const PredictionLog = require("../models/PredictionLog");
const { stockService } = require("./stockService");

const calculateConfidence = (indicators) => {
  const votes = [];

  if (indicators.sma) votes.push(indicators.sma.agree ? 1 : 0);
  if (indicators.rsi) votes.push(indicators.rsi.agree ? 1 : 0);
  if (indicators.macd) votes.push(indicators.macd.agree ? 1 : 0);
  if (indicators.bollinger) votes.push(indicators.bollinger.agree ? 1 : 0);

  if (votes.length === 0) return 50;

  const agreement = votes.reduce((sum, v) => sum + v, 0) / votes.length;
  return Math.round(agreement * 80 + 20);
};

const determineSignal = (indicators) => {
  const signals = [];

  if (indicators.sma?.value === "BUY") signals.push("BUY");
  else if (indicators.sma?.value === "SELL") signals.push("SELL");
  else signals.push("HOLD");

  if (indicators.macd?.value === "BUY") signals.push("BUY");
  else if (indicators.macd?.value === "SELL") signals.push("SELL");
  else signals.push("HOLD");

  if (indicators.rsi?.value === "BUY") signals.push("BUY");
  else if (indicators.rsi?.value === "SELL") signals.push("SELL");
  else signals.push("HOLD");

  const buys = signals.filter((s) => s === "BUY").length;
  const sells = signals.filter((s) => s === "SELL").length;

  if (buys > sells && buys > signals.length / 2) return "BUY";
  if (sells > buys && sells > signals.length / 2) return "SELL";
  return "HOLD";
};

exports.logPrediction = async (
  symbol,
  entryPrice,
  indicators,
  userId = null,
) => {
  try {
    const signal = determineSignal(indicators);
    const confidence = calculateConfidence(indicators);

    const prediction = new PredictionLog({
      userId,
      symbol,
      signal,
      confidence,
      entryPrice,
      indicators,
      entryDate: new Date(),
    });

    await prediction.save();

    // Trigger alert if userId provided and confidence is high enough
    if (userId && confidence >= 60) {
      try {
        const { sendAlert } = require("./alertService");
        const alertResult = await sendAlert(
          prediction._id,
          userId,
          symbol,
          signal,
          confidence,
        );
        // Attach alert result but don't fail the prediction save
        prediction.alertSent = alertResult.sent;
        if (alertResult.sent) {
          prediction.alertSentAt = new Date();
          await prediction.save();
        }
      } catch (alertError) {
        console.error("Error triggering alert:", alertError);
        // Continue even if alert fails
      }
    }

    return prediction;
  } catch (error) {
    throw error;
  }
};

exports.updatePredictionOutcomes = async () => {
  try {
    const predictions = await PredictionLog.find({
      outcome30d: "PENDING",
    });

    for (const pred of predictions) {
      try {
        const stockData = await stockService.getStockBySymbol(pred.symbol);
        const currentPrice = stockData.price;
        const daysSinceEntry = Math.floor(
          (Date.now() - pred.entryDate) / (1000 * 60 * 60 * 24),
        );

        if (daysSinceEntry >= 7 && pred.outcome7d === "PENDING") {
          const return7d =
            ((currentPrice - pred.entryPrice) / pred.entryPrice) * 100;
          const outcome7d = return7d > 0 ? "WIN" : "LOSS";

          await PredictionLog.findByIdAndUpdate(pred._id, {
            priceAt7d: currentPrice,
            returnPercent7d: return7d,
            outcome7d,
          });
        }

        if (daysSinceEntry >= 30 && pred.outcome30d === "PENDING") {
          const return30d =
            ((currentPrice - pred.entryPrice) / pred.entryPrice) * 100;
          const outcome30d = return30d > 0 ? "WIN" : "LOSS";

          await PredictionLog.findByIdAndUpdate(pred._id, {
            priceAt30d: currentPrice,
            returnPercent30d: return30d,
            outcome30d,
          });
        }
      } catch (error) {
        console.error(`Error updating prediction for ${pred.symbol}:`, error);
      }
    }
  } catch (error) {
    throw error;
  }
};

exports.getAccuracyStats = async (userId = null) => {
  try {
    const query = userId ? { userId } : { userId: null };
    const predictions = await PredictionLog.find(query);

    if (predictions.length === 0) {
      return {
        total: 0,
        buy: { count: 0, wins: 0, accuracy: 0 },
        sell: { count: 0, wins: 0, accuracy: 0 },
        hold: { count: 0, wins: 0, accuracy: 0 },
        overall7d: { accuracy: 0, avgReturn: 0 },
        overall30d: { accuracy: 0, avgReturn: 0 },
      };
    }

    const buyPreds = predictions.filter((p) => p.signal === "BUY");
    const sellPreds = predictions.filter((p) => p.signal === "SELL");
    const holdPreds = predictions.filter((p) => p.signal === "HOLD");

    const calculateSignalStats = (preds, horizon = "7d") => {
      const outcome = horizon === "7d" ? "outcome7d" : "outcome30d";
      const completed = preds.filter((p) => p[outcome] !== "PENDING");
      if (completed.length === 0)
        return { count: preds.length, wins: 0, accuracy: 0 };

      const wins = completed.filter((p) => p[outcome] === "WIN").length;
      return {
        count: preds.length,
        wins,
        accuracy: Math.round((wins / completed.length) * 100),
      };
    };

    const stats7d = predictions.filter((p) => p.outcome7d !== "PENDING");
    const stats30d = predictions.filter((p) => p.outcome30d !== "PENDING");

    const avgReturn7d =
      stats7d.length > 0
        ? stats7d.reduce((sum, p) => sum + (p.returnPercent7d || 0), 0) /
          stats7d.length
        : 0;
    const avgReturn30d =
      stats30d.length > 0
        ? stats30d.reduce((sum, p) => sum + (p.returnPercent30d || 0), 0) /
          stats30d.length
        : 0;

    return {
      total: predictions.length,
      buy: calculateSignalStats(buyPreds, "7d"),
      sell: calculateSignalStats(sellPreds, "7d"),
      hold: calculateSignalStats(holdPreds, "7d"),
      overall7d: {
        accuracy: Math.round(
          (stats7d.filter((p) => p.outcome7d === "WIN").length /
            (stats7d.length || 1)) *
            100,
        ),
        avgReturn: Math.round(avgReturn7d * 100) / 100,
      },
      overall30d: {
        accuracy: Math.round(
          (stats30d.filter((p) => p.outcome30d === "WIN").length /
            (stats30d.length || 1)) *
            100,
        ),
        avgReturn: Math.round(avgReturn30d * 100) / 100,
      },
    };
  } catch (error) {
    throw error;
  }
};
