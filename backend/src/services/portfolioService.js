const Portfolio = require("../models/Portfolio");
const stockService = require("./stockService");

const getOrCreatePortfolio = async (userId) => {
  let portfolio = await Portfolio.findOne({ userId });
  if (!portfolio) {
    portfolio = await Portfolio.create({ userId, cash: 10000, holdings: [] });
  }
  return portfolio;
};

const enrichHoldings = async (holdings) => {
  const quotes = await Promise.all(
    holdings.map((holding) => stockService.getStockBySymbol(holding.symbol)),
  );

  return holdings.map((holding, index) => {
    const quote = quotes[index];
    const marketValue = quote.price * holding.shares;
    const costBasis = holding.avgCost * holding.shares;
    const unrealized = marketValue - costBasis;

    return {
      ...holding,
      currentPrice: quote.price,
      marketValue,
      unrealized,
      source: quote.source,
      updatedAt: quote.updatedAt,
    };
  });
};

exports.getPortfolio = async (userId) => {
  const portfolio = await getOrCreatePortfolio(userId);
  const enrichedHoldings = await enrichHoldings(portfolio.holdings);
  const holdingsValue = enrichedHoldings.reduce(
    (sum, holding) => sum + holding.marketValue,
    0,
  );

  return {
    cash: portfolio.cash,
    holdings: enrichedHoldings,
    holdingsValue,
    totalValue: portfolio.cash + holdingsValue,
    transactions: portfolio.transactions.slice(-20).reverse(),
  };
};

exports.buyStock = async (userId, symbol, shares) => {
  const portfolio = await getOrCreatePortfolio(userId);
  const quote = await stockService.getStockBySymbol(symbol);

  const normalizedShares = Number(shares);
  if (!Number.isFinite(normalizedShares) || normalizedShares <= 0) {
    throw new Error("Shares must be greater than 0");
  }

  const cost = normalizedShares * quote.price;
  if (portfolio.cash < cost) {
    throw new Error("Insufficient cash balance");
  }

  const existing = portfolio.holdings.find(
    (holding) => holding.symbol === quote.symbol,
  );

  if (existing) {
    const totalShares = existing.shares + normalizedShares;
    const totalCost = existing.avgCost * existing.shares + cost;
    existing.shares = totalShares;
    existing.avgCost = totalCost / totalShares;
  } else {
    portfolio.holdings.push({
      symbol: quote.symbol,
      shares: normalizedShares,
      avgCost: quote.price,
    });
  }

  portfolio.cash -= cost;
  portfolio.transactions.push({
    type: "BUY",
    symbol: quote.symbol,
    shares: normalizedShares,
    price: quote.price,
  });

  await portfolio.save();
  return exports.getPortfolio(userId);
};

exports.sellStock = async (userId, symbol, shares) => {
  const portfolio = await getOrCreatePortfolio(userId);
  const quote = await stockService.getStockBySymbol(symbol);

  const normalizedShares = Number(shares);
  if (!Number.isFinite(normalizedShares) || normalizedShares <= 0) {
    throw new Error("Shares must be greater than 0");
  }

  const holding = portfolio.holdings.find(
    (item) => item.symbol === quote.symbol,
  );
  if (!holding || holding.shares < normalizedShares) {
    throw new Error("Not enough shares to sell");
  }

  const proceeds = normalizedShares * quote.price;
  holding.shares -= normalizedShares;

  if (holding.shares === 0) {
    portfolio.holdings = portfolio.holdings.filter(
      (item) => item.symbol !== quote.symbol,
    );
  }

  portfolio.cash += proceeds;
  portfolio.transactions.push({
    type: "SELL",
    symbol: quote.symbol,
    shares: normalizedShares,
    price: quote.price,
  });

  await portfolio.save();
  return exports.getPortfolio(userId);
};
