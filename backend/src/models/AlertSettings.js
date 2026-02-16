const mongoose = require("mongoose");

const alertSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    enableBrowserNotifications: {
      type: Boolean,
      default: true,
    },
    minConfidenceThreshold: {
      type: Number,
      min: 0,
      max: 100,
      default: 75,
    },
    alertOnSignals: {
      buy: { type: Boolean, default: true },
      sell: { type: Boolean, default: true },
      hold: { type: Boolean, default: false },
    },
    muteUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("AlertSettings", alertSettingsSchema);
