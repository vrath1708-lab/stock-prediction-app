const mongoose = require("mongoose");

const predictionLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    symbol: {
      type: String,
      required: true,
      index: true,
    },
    signal: {
      type: String,
      enum: ["BUY", "HOLD", "SELL"],
      required: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    entryPrice: {
      type: Number,
      required: true,
    },
    entryDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    targetPrice: {
      type: Number,
      default: null,
    },
    indicators: {
      sma: { agree: Boolean, value: String },
      rsi: { agree: Boolean, value: String },
      macd: { agree: Boolean, value: String },
      bollinger: { agree: Boolean, value: String },
    },
    priceAt7d: {
      type: Number,
      default: null,
    },
    priceAt30d: {
      type: Number,
      default: null,
    },
    outcome7d: {
      type: String,
      enum: ["WIN", "LOSS", "PENDING"],
      default: "PENDING",
    },
    outcome30d: {
      type: String,
      enum: ["WIN", "LOSS", "PENDING"],
      default: "PENDING",
    },
    returnPercent7d: {
      type: Number,
      default: null,
    },
    returnPercent30d: {
      type: Number,
      default: null,
    },
    alertSent: {
      type: Boolean,
      default: false,
    },
    alertSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("PredictionLog", predictionLogSchema);
