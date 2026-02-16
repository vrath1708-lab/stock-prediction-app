const PredictionLog = require("../models/PredictionLog");
const AlertSettings = require("../models/AlertSettings");

const shouldSendAlert = async (userId, signal, confidence) => {
  try {
    let settings = await AlertSettings.findOne({ userId });

    if (!settings) {
      settings = new AlertSettings({ userId });
      await settings.save();
    }

    if (settings.muteUntil && new Date() < settings.muteUntil) {
      return false;
    }

    if (confidence < settings.minConfidenceThreshold) {
      return false;
    }

    if (!settings.alertOnSignals[signal.toLowerCase()]) {
      return false;
    }

    return settings.enableBrowserNotifications;
  } catch (error) {
    console.error("Error checking alert conditions:", error);
    return false;
  }
};

const sendAlert = async (predictionId, userId, symbol, signal, confidence) => {
  try {
    const shouldAlert = await shouldSendAlert(userId, signal, confidence);

    if (!shouldAlert) {
      return { sent: false, reason: "Alert conditions not met" };
    }

    await PredictionLog.findByIdAndUpdate(predictionId, {
      alertSent: true,
      alertSentAt: new Date(),
    });

    return {
      sent: true,
      message: `🚨 ${signal} signal for ${symbol} (${confidence}% confidence)`,
      title: `TradingSignal: ${symbol}`,
      symbol,
      signal,
      confidence,
    };
  } catch (error) {
    console.error("Error sending alert:", error);
    return { sent: false, error: error.message };
  }
};

const processNewPredictions = async () => {
  try {
    const unsentAlerts = await PredictionLog.find({
      alertSent: false,
      confidence: { $gte: 60 },
    }).limit(50);

    const results = [];

    for (const pred of unsentAlerts) {
      if (pred.userId) {
        const alert = await sendAlert(
          pred._id,
          pred.userId,
          pred.symbol,
          pred.signal,
          pred.confidence,
        );
        results.push(alert);
      }
    }

    return results;
  } catch (error) {
    console.error("Error processing new predictions:", error);
    return [];
  }
};

const getAlertSettings = async (userId) => {
  try {
    let settings = await AlertSettings.findOne({ userId });

    if (!settings) {
      settings = new AlertSettings({ userId });
      await settings.save();
    }

    return settings;
  } catch (error) {
    console.error("Error fetching alert settings:", error);
    throw error;
  }
};

const updateAlertSettings = async (userId, updates) => {
  try {
    let settings = await AlertSettings.findOne({ userId });

    if (!settings) {
      settings = new AlertSettings({ userId });
    }

    Object.assign(settings, updates);
    await settings.save();

    return settings;
  } catch (error) {
    console.error("Error updating alert settings:", error);
    throw error;
  }
};

const muteAlerts = async (userId, minutes = 60) => {
  try {
    const muteUntil = new Date(Date.now() + minutes * 60 * 1000);

    const settings = await updateAlertSettings(userId, { muteUntil });

    return { muteUntil, message: `Alerts muted for ${minutes} minutes` };
  } catch (error) {
    console.error("Error muting alerts:", error);
    throw error;
  }
};

module.exports = {
  sendAlert,
  shouldSendAlert,
  processNewPredictions,
  getAlertSettings,
  updateAlertSettings,
  muteAlerts,
};
