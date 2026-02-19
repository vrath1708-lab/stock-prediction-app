import React, { useState, useEffect } from "react";
import { stockService } from "../services/api";
import useLiveRefresh from "../hooks/useLiveRefresh";

const AlertSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("settings");

  useEffect(() => {
    // Request notification permission on mount
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const fetchSettings = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      const data = await stockService.getAlertSettings();
      setSettings(data);
    } catch (error) {
      console.error("Error fetching alert settings:", error);
      setMessage("Failed to load alert settings");
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  const { lastUpdated, refreshing } = useLiveRefresh(
    () => fetchSettings(false),
    {
      intervalMs: 30000,
      enabled: true,
      runOnMount: true,
    },
  );

  const handleToggle = (field) => {
    setSettings((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSignalToggle = (signal) => {
    setSettings((prev) => ({
      ...prev,
      alertOnSignals: {
        ...prev.alertOnSignals,
        [signal]: !prev.alertOnSignals[signal],
      },
    }));
  };

  const handleThresholdChange = (value) => {
    setSettings((prev) => ({
      ...prev,
      minConfidenceThreshold: parseInt(value),
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");

      await stockService.updateAlertSettings({
        enableBrowserNotifications: settings.enableBrowserNotifications,
        minConfidenceThreshold: settings.minConfidenceThreshold,
        alertOnSignals: settings.alertOnSignals,
      });

      setMessage("✅ Alert settings saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage("❌ Failed to save alert settings");
    } finally {
      setSaving(false);
    }
  };

  const handleMute = async (minutes) => {
    try {
      setSaving(true);
      await stockService.muteAlerts(minutes);
      setMessage(`🔇 Alerts muted for ${minutes} minutes`);
      setTimeout(() => setMessage(""), 5000);
      setTimeout(() => fetchSettings(), minutes * 60 * 1000);
    } catch (error) {
      console.error("Error muting alerts:", error);
      setMessage("❌ Failed to mute alerts");
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = () => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("StockPredict Alert Test", {
        body: "🚀 This is a test notification!",
        icon: "📈",
      });
      setMessage("📢 Test notification sent!");
    } else {
      setMessage(
        "❌ Browser notifications not enabled. Click 'Enable' to activate.",
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading alert settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-8 rounded-lg">
        <h1 className="text-4xl font-bold mb-2">Alert Management</h1>
        <p className="text-orange-100">
          Configure notifications for trading signals
        </p>
        <p className="text-orange-100 text-sm mt-2">
          Last updated:{" "}
          {lastUpdated ? lastUpdated.toLocaleTimeString() : "Syncing..."}
          {refreshing ? " • Updating" : ""}
        </p>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.startsWith("✅") || message.startsWith("📢")
              ? "bg-green-100 text-green-800"
              : message.startsWith("❌")
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
          }`}
        >
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2 font-semibold ${
            activeTab === "settings"
              ? "text-orange-600 border-b-2 border-orange-600"
              : "text-gray-600"
          }`}
        >
          Notification Settings
        </button>
        <button
          onClick={() => setActiveTab("quick")}
          className={`px-4 py-2 font-semibold ${
            activeTab === "quick"
              ? "text-orange-600 border-b-2 border-orange-600"
              : "text-gray-600"
          }`}
        >
          Quick Actions
        </button>
      </div>

      {/* Settings Tab */}
      {activeTab === "settings" && settings && (
        <div className="space-y-6">
          {/* Enable Notifications */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Notification Method</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableBrowserNotifications}
                  onChange={() => handleToggle("enableBrowserNotifications")}
                  className="w-5 h-5"
                />
                <span>
                  {settings.enableBrowserNotifications
                    ? "✅ Browser Notifications Enabled"
                    : "⭕ Browser Notifications Disabled"}
                </span>
              </label>
              <button
                onClick={handleTestNotification}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                📢 Send Test Notification
              </button>
            </div>
          </div>

          {/* Confidence Threshold */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Minimum Confidence</h3>
            <p className="text-gray-600 mb-4">
              Only send alerts for predictions with confidence ≥{" "}
              {settings.minConfidenceThreshold}%
            </p>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={settings.minConfidenceThreshold}
                onChange={(e) => handleThresholdChange(e.target.value)}
                className="flex-1"
              />
              <span className="text-2xl font-bold text-orange-600 min-w-[60px]">
                {settings.minConfidenceThreshold}%
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Higher threshold = fewer but higher-quality alerts
            </p>
          </div>

          {/* Signal Preferences */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">
              Alert on Signal Types
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.alertOnSignals?.buy}
                  onChange={() => handleSignalToggle("buy")}
                  className="w-5 h-5"
                />
                <span className="text-green-600 font-semibold">
                  BUY Signals
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.alertOnSignals?.sell}
                  onChange={() => handleSignalToggle("sell")}
                  className="w-5 h-5"
                />
                <span className="text-red-600 font-semibold">SELL Signals</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.alertOnSignals?.hold}
                  onChange={() => handleSignalToggle("hold")}
                  className="w-5 h-5"
                />
                <span className="text-yellow-600 font-semibold">
                  HOLD Signals
                </span>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition disabled:bg-gray-400"
          >
            {saving ? "Saving..." : "💾 Save Settings"}
          </button>
        </div>
      )}

      {/* Quick Actions Tab */}
      {activeTab === "quick" && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Mute Alerts</h3>
            <p className="text-gray-600 mb-4">
              Temporarily pause all notifications
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => handleMute(30)}
                disabled={saving}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition disabled:bg-gray-400"
              >
                30 min
              </button>
              <button
                onClick={() => handleMute(60)}
                disabled={saving}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition disabled:bg-gray-400"
              >
                1 hour
              </button>
              <button
                onClick={() => handleMute(240)}
                disabled={saving}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition disabled:bg-gray-400"
              >
                4 hours
              </button>
              <button
                onClick={() => handleMute(1440)}
                disabled={saving}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition disabled:bg-gray-400"
              >
                24 hours
              </button>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">
                📱 Browser Notifications
              </h4>
              <p className="text-sm text-green-800">
                Real-time alerts pop up on your screen
              </p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">
                ⚙️ Smart Filtering
              </h4>
              <p className="text-sm text-blue-800">
                Alerts respect your confidence & signal preferences
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-900 mb-2">🔔 No Spam</h4>
              <p className="text-sm text-orange-800">
                Only high-quality signals trigger alerts
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertSettings;
