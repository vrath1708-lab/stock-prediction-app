const mongoose = require("mongoose");

const holdingSchema = new mongoose.Schema(
  {
    symbol: { type: String, required: true },
    shares: { type: Number, required: true },
    avgCost: { type: Number, required: true },
  },
  { _id: false },
);

const transactionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["BUY", "SELL"], required: true },
    symbol: { type: String, required: true },
    shares: { type: Number, required: true },
    price: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false },
);

const portfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    cash: { type: Number, default: 10000 },
    holdings: [holdingSchema],
    transactions: [transactionSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Portfolio", portfolioSchema);
