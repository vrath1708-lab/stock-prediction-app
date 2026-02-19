const express = require("express");
const router = express.Router();
const stockService = require("../services/stockService");
const analysisService = require("../services/analysisService");

router.get("/stream", async (req, res) => {
  const include = new Set(
    (req.query.include || "heartbeat")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
  );
  const symbol = req.query.symbol ? String(req.query.symbol).toUpperCase() : null;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  const sendEvent = (event, payload) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  const sendUpdate = async () => {
    const payload = {
      timestamp: new Date().toISOString(),
      include: Array.from(include),
    };

    if (include.has("stocks")) {
      try {
        payload.topStocks = await stockService.getTopStocks();
      } catch (error) {
        payload.topStocksError = error.message;
      }
    }

    if (symbol && include.has("analysis")) {
      try {
        payload.analysis = await analysisService.getTechnicalAnalysis(symbol);
      } catch (error) {
        payload.analysisError = error.message;
      }
    }

    sendEvent("update", payload);
  };

  sendEvent("connected", {
    timestamp: new Date().toISOString(),
    message: "Live stream connected",
  });

  await sendUpdate();

  const updateInterval = setInterval(sendUpdate, 15000);
  const keepAliveInterval = setInterval(() => {
    res.write(": keep-alive\n\n");
  }, 25000);

  req.on("close", () => {
    clearInterval(updateInterval);
    clearInterval(keepAliveInterval);
    res.end();
  });
});

module.exports = router;
