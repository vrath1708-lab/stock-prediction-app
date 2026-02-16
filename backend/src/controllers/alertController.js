const {
  getAlertSettings,
  updateAlertSettings,
  muteAlerts,
  processNewPredictions,
} = require("../services/alertService");

exports.getSettings = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const settings = await getAlertSettings(userId);
    res.json(settings);
  } catch (error) {
    console.error("Error fetching alert settings:", error);
    res.status(500).json({ error: "Failed to fetch alert settings" });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const updates = req.body;

    const allowedFields = [
      "enableBrowserNotifications",
      "minConfidenceThreshold",
      "alertOnSignals",
    ];
    const filteredUpdates = {};

    allowedFields.forEach((field) => {
      if (field in updates) {
        filteredUpdates[field] = updates[field];
      }
    });

    const settings = await updateAlertSettings(userId, filteredUpdates);
    res.json(settings);
  } catch (error) {
    console.error("Error updating alert settings:", error);
    res.status(500).json({ error: "Failed to update alert settings" });
  }
};

exports.muteAlerts = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { minutes = 60 } = req.body;
    const result = await muteAlerts(userId, minutes);

    res.json(result);
  } catch (error) {
    console.error("Error muting alerts:", error);
    res.status(500).json({ error: "Failed to mute alerts" });
  }
};

exports.processAlerts = async (req, res) => {
  try {
    const results = await processNewPredictions();
    res.json({
      message: "Alert processing complete",
      processed: results.length,
      alerts: results,
    });
  } catch (error) {
    console.error("Error processing alerts:", error);
    res.status(500).json({ error: "Failed to process alerts" });
  }
};
