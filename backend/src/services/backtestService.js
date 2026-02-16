const stockService = require("./stockService");

const calculateSMA = (values, period) => {
  const result = Array(values.length).fill(null);
  for (let i = period - 1; i < values.length; i += 1) {
    const slice = values.slice(i - period + 1, i + 1);
    const avg = slice.reduce((sum, val) => sum + val, 0) / period;
    result[i] = avg;
  }
  return result;
};

const calculateMaxDrawdown = (equityCurve) => {
  let peak = equityCurve[0]?.equity || 0;
  let maxDrawdown = 0;

  equityCurve.forEach((point) => {
    if (point.equity > peak) {
      peak = point.equity;
    }
    const drawdown = peak > 0 ? (peak - point.equity) / peak : 0;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });

  return maxDrawdown;
};

exports.runSmaBacktest = async ({
  symbol,
  fastPeriod = 20,
  slowPeriod = 50,
  initialCash = 10000,
  days = 200,
}) => {
  const history = await stockService.getHistoricalData(symbol, days);
  if (!history.length) {
    throw new Error("No historical data available for backtest");
  }

  const closes = history.map((item) => item.close);
  const fastSma = calculateSMA(closes, fastPeriod);
  const slowSma = calculateSMA(closes, slowPeriod);

  let cash = initialCash;
  let shares = 0;
  const trades = [];
  const equityCurve = [];

  for (let i = 0; i < history.length; i += 1) {
    const price = closes[i];
    if (!fastSma[i] || !slowSma[i]) {
      equityCurve.push({
        date: history[i].date,
        equity: cash + shares * price,
        cash,
        shares,
      });
      continue;
    }

    const prevFast = fastSma[i - 1];
    const prevSlow = slowSma[i - 1];
    const fastAbove = fastSma[i] > slowSma[i];
    const prevFastAbove =
      prevFast && prevSlow ? prevFast > prevSlow : fastAbove;

    if (!shares && fastAbove && !prevFastAbove) {
      const buyShares = Math.floor(cash / price);
      if (buyShares > 0) {
        shares = buyShares;
        cash -= buyShares * price;
        trades.push({
          type: "BUY",
          date: history[i].date,
          price,
          shares: buyShares,
        });
      }
    }

    if (shares && !fastAbove && prevFastAbove) {
      cash += shares * price;
      trades.push({
        type: "SELL",
        date: history[i].date,
        price,
        shares,
      });
      shares = 0;
    }

    equityCurve.push({
      date: history[i].date,
      equity: cash + shares * price,
      cash,
      shares,
    });
  }

  const finalEquity = equityCurve[equityCurve.length - 1].equity;
  const totalReturn = (finalEquity - initialCash) / initialCash;
  const maxDrawdown = calculateMaxDrawdown(equityCurve);
  const winningTrades = trades.filter((trade, index) => {
    if (trade.type !== "SELL") return false;
    const buyTrade = trades[index - 1];
    if (!buyTrade) return false;
    return trade.price > buyTrade.price;
  });

  return {
    symbol: symbol.toUpperCase(),
    fastPeriod,
    slowPeriod,
    initialCash,
    finalEquity,
    totalReturn,
    maxDrawdown,
    winRate: trades.length ? winningTrades.length / (trades.length / 2) : 0,
    trades,
    equityCurve,
  };
};
