const axios = require("axios");

const ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query";
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const QUOTE_CACHE_TTL_MS = 60 * 1000;
const HISTORY_CACHE_TTL_MS = 60 * 1000;
const SEARCH_CACHE_TTL_MS = 60 * 1000;

const quoteCache = new Map();
const historyCache = new Map();
const searchCache = new Map();

const hasAlphaVantageKey = () =>
  Boolean(ALPHA_VANTAGE_API_KEY && ALPHA_VANTAGE_API_KEY !== "your_api_key");

const fetchAlphaVantage = async (params) => {
  if (!hasAlphaVantageKey()) {
    throw new Error("Alpha Vantage API key is not configured");
  }

  const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
    params: { ...params, apikey: ALPHA_VANTAGE_API_KEY },
  });

  const data = response.data || {};
  const errorMessage =
    data.Note || data.Information || data["Error Message"] || null;

  if (errorMessage) {
    throw new Error(errorMessage);
  }

  return data;
};

const normalizeSymbol = (symbol) =>
  String(symbol || "")
    .trim()
    .toUpperCase();

const getSymbolSeed = (symbol) =>
  normalizeSymbol(symbol)
    .split("")
    .reduce((seed, char, index) => seed + char.charCodeAt(0) * (index + 1), 0);

const buildSyntheticQuote = (symbol, name = null) => {
  const normalizedSymbol = normalizeSymbol(symbol);
  const seed = getSymbolSeed(normalizedSymbol);
  const basePrice = 40 + (seed % 460);
  const swing = ((seed % 120) - 60) / 100;
  const change = Number((swing / 10).toFixed(2));
  const signal = change >= 1 ? "BUY" : change <= -1 ? "SELL" : "HOLD";
  const confidence = Math.min(90, Math.max(55, 62 + Math.abs(change) * 8));

  return {
    symbol: normalizedSymbol,
    name: name || `${normalizedSymbol} Corp.`,
    price: Number((basePrice + swing).toFixed(2)),
    change,
    signal,
    confidence: Number(confidence.toFixed(1)),
    volume: ensureVolume(1500000 + (seed % 9000000)),
    source: "Synthetic",
    updatedAt: new Date().toISOString(),
  };
};

const getCachedValue = (cache, key, ttlMs) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > ttlMs) {
    cache.delete(key);
    return null;
  }
  return entry.value;
};

const setCachedValue = (cache, key, value) => {
  cache.set(key, { value, timestamp: Date.now() });
};

const ensureVolume = (volume) =>
  Number.isFinite(volume)
    ? volume
    : Math.floor(2000000 + Math.random() * 8000000);

const mockStocks = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 175.43,
    change: 2.5,
    signal: "BUY",
    confidence: 82.5,
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 142.75,
    change: 1.8,
    signal: "BUY",
    confidence: 75.0,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    price: 378.23,
    change: -0.5,
    signal: "HOLD",
    confidence: 68.0,
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: 173.31,
    change: 3.2,
    signal: "BUY",
    confidence: 79.5,
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 248.81,
    change: -2.1,
    signal: "SELL",
    confidence: 72.0,
  },
  {
    symbol: "META",
    name: "Meta Platforms Inc.",
    price: 487.56,
    change: 4.3,
    signal: "BUY",
    confidence: 85.2,
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    price: 875.42,
    change: 5.1,
    signal: "BUY",
    confidence: 88.7,
  },
  {
    symbol: "NFLX",
    name: "Netflix Inc.",
    price: 612.34,
    change: 2.8,
    signal: "BUY",
    confidence: 76.3,
  },
  {
    symbol: "AMD",
    name: "Advanced Micro Devices",
    price: 184.56,
    change: 3.5,
    signal: "BUY",
    confidence: 78.9,
  },
  {
    symbol: "INTC",
    name: "Intel Corp.",
    price: 45.23,
    change: -1.2,
    signal: "HOLD",
    confidence: 62.5,
  },
  {
    symbol: "JPM",
    name: "JPMorgan Chase & Co.",
    price: 198.76,
    change: 1.5,
    signal: "BUY",
    confidence: 74.8,
  },
  {
    symbol: "BAC",
    name: "Bank of America Corp.",
    price: 39.45,
    change: 0.8,
    signal: "HOLD",
    confidence: 65.2,
  },
  {
    symbol: "WMT",
    name: "Walmart Inc.",
    price: 168.92,
    change: 1.2,
    signal: "BUY",
    confidence: 71.5,
  },
  {
    symbol: "DIS",
    name: "Walt Disney Co.",
    price: 112.54,
    change: -0.8,
    signal: "HOLD",
    confidence: 66.7,
  },
  {
    symbol: "BA",
    name: "Boeing Co.",
    price: 203.67,
    change: 2.4,
    signal: "BUY",
    confidence: 73.4,
  },
  {
    symbol: "V",
    name: "Visa Inc.",
    price: 278.34,
    change: 1.9,
    signal: "BUY",
    confidence: 80.1,
  },
  {
    symbol: "MA",
    name: "Mastercard Inc.",
    price: 456.78,
    change: 2.1,
    signal: "BUY",
    confidence: 81.3,
  },
  {
    symbol: "PYPL",
    name: "PayPal Holdings Inc.",
    price: 72.45,
    change: -1.5,
    signal: "SELL",
    confidence: 70.2,
  },
  {
    symbol: "ORCL",
    name: "Oracle Corp.",
    price: 125.89,
    change: 1.7,
    signal: "BUY",
    confidence: 75.6,
  },
  {
    symbol: "CRM",
    name: "Salesforce Inc.",
    price: 298.45,
    change: 3.1,
    signal: "BUY",
    confidence: 77.8,
  },
  {
    symbol: "ADBE",
    name: "Adobe Inc.",
    price: 612.23,
    change: 2.6,
    signal: "BUY",
    confidence: 79.2,
  },
  {
    symbol: "CSCO",
    name: "Cisco Systems Inc.",
    price: 52.34,
    change: 0.5,
    signal: "HOLD",
    confidence: 64.8,
  },
  {
    symbol: "PEP",
    name: "PepsiCo Inc.",
    price: 178.56,
    change: 0.9,
    signal: "HOLD",
    confidence: 67.3,
  },
  {
    symbol: "KO",
    name: "Coca-Cola Co.",
    price: 62.78,
    change: 0.6,
    signal: "HOLD",
    confidence: 66.1,
  },
  {
    symbol: "NKE",
    name: "Nike Inc.",
    price: 108.92,
    change: -0.9,
    signal: "HOLD",
    confidence: 63.5,
  },
  {
    symbol: "COST",
    name: "Costco Wholesale Corp.",
    price: 732.45,
    change: 1.8,
    signal: "BUY",
    confidence: 76.9,
  },
  {
    symbol: "UNH",
    name: "UnitedHealth Group Inc.",
    price: 523.67,
    change: 2.2,
    signal: "BUY",
    confidence: 78.4,
  },
  {
    symbol: "HD",
    name: "Home Depot Inc.",
    price: 378.91,
    change: 1.4,
    signal: "BUY",
    confidence: 74.2,
  },
  {
    symbol: "MCD",
    name: "McDonald's Corp.",
    price: 298.34,
    change: 0.7,
    signal: "HOLD",
    confidence: 68.9,
  },
  {
    symbol: "XOM",
    name: "Exxon Mobil Corp.",
    price: 112.45,
    change: 1.1,
    signal: "HOLD",
    confidence: 65.7,
  },
];

exports.getTopStocks = async () => {
  try {
    // In production, fetch from database or external API
    return mockStocks.map((stock) => ({
      ...stock,
      volume: ensureVolume(stock.volume),
      source: "Mock",
      updatedAt: new Date().toISOString(),
    }));
  } catch (error) {
    throw error;
  }
};

exports.getStockBySymbol = async (symbol) => {
  try {
    const normalizedSymbol = normalizeSymbol(symbol);
    const fallbackStock = mockStocks.find((s) => s.symbol === normalizedSymbol);

    const cachedQuote = getCachedValue(
      quoteCache,
      normalizedSymbol,
      QUOTE_CACHE_TTL_MS,
    );
    if (cachedQuote) {
      return cachedQuote;
    }

    if (hasAlphaVantageKey()) {
      try {
        const data = await fetchAlphaVantage({
          function: "GLOBAL_QUOTE",
          symbol: normalizedSymbol,
        });

        const quote = data["Global Quote"] || {};
        const price = parseFloat(quote["05. price"]);
        const changePercentRaw = quote["10. change percent"] || "0";
        const changePercent = parseFloat(
          String(changePercentRaw).replace("%", ""),
        );
        const volume = parseInt(quote["06. volume"], 10);

        if (!Number.isFinite(price)) {
          throw new Error("Quote data unavailable");
        }

        const change = Number.isFinite(changePercent) ? changePercent : 0;
        const signal = change >= 1 ? "BUY" : change <= -1 ? "SELL" : "HOLD";
        const confidence = Math.min(
          95,
          Math.max(55, Math.abs(change) * 5 + 60),
        );

        const result = {
          symbol: normalizedSymbol,
          name: fallbackStock?.name || normalizedSymbol,
          price,
          change,
          signal,
          confidence,
          volume: ensureVolume(volume),
          source: "Alpha Vantage",
          updatedAt: new Date().toISOString(),
        };
        setCachedValue(quoteCache, normalizedSymbol, result);
        return result;
      } catch (error) {
        if (!fallbackStock) {
          const synthetic = buildSyntheticQuote(normalizedSymbol);
          setCachedValue(quoteCache, normalizedSymbol, synthetic);
          return synthetic;
        }
      }
    }

    if (!fallbackStock) {
      const synthetic = buildSyntheticQuote(normalizedSymbol);
      setCachedValue(quoteCache, normalizedSymbol, synthetic);
      return synthetic;
    }
    const fallbackResult = {
      ...fallbackStock,
      volume: ensureVolume(fallbackStock.volume),
      source: "Mock",
      updatedAt: new Date().toISOString(),
    };
    setCachedValue(quoteCache, normalizedSymbol, fallbackResult);
    return fallbackResult;
  } catch (error) {
    throw error;
  }
};

exports.getHistoricalData = async (symbol, days = 30) => {
  try {
    const normalizedSymbol = normalizeSymbol(symbol);
    const historyCacheKey = `${normalizedSymbol}:${days}`;
    const cachedHistory = getCachedValue(
      historyCache,
      historyCacheKey,
      HISTORY_CACHE_TTL_MS,
    );
    if (cachedHistory) {
      return cachedHistory;
    }

    if (hasAlphaVantageKey()) {
      try {
        const data = await fetchAlphaVantage({
          function: "TIME_SERIES_DAILY_ADJUSTED",
          symbol: normalizedSymbol,
          outputsize: "compact",
        });

        const series = data["Time Series (Daily)"] || {};
        const dates = Object.keys(series).sort();
        const slicedDates = dates.slice(-days);

        if (slicedDates.length === 0) {
          throw new Error("Historical data unavailable");
        }

        const result = slicedDates.map((date) => {
          const row = series[date] || {};
          return {
            date,
            open: parseFloat(row["1. open"]),
            high: parseFloat(row["2. high"]),
            low: parseFloat(row["3. low"]),
            close: parseFloat(row["4. close"]),
            volume: parseInt(row["6. volume"] || row["5. volume"], 10),
          };
        });
        setCachedValue(historyCache, historyCacheKey, result);
        return result;
      } catch (error) {
        // Fall back to mock data when API is unavailable or rate-limited.
      }
    }

    // Generate mock historical data
    const data = [];
    const now = new Date();

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split("T")[0],
        open: 100 + Math.random() * 50,
        close: 100 + Math.random() * 50,
        high: 110 + Math.random() * 50,
        low: 95 + Math.random() * 30,
        volume: Math.floor(Math.random() * 10000000),
      });
    }

    setCachedValue(historyCache, historyCacheKey, data);
    return data;
  } catch (error) {
    throw error;
  }
};

exports.searchSymbols = async (query, options = {}) => {
  try {
    const normalizedQuery = String(query || "").trim();
    if (!normalizedQuery) {
      return { items: [], total: 0, page: 1, pageSize: 10, source: "None" };
    }

    const { page = 1, pageSize = 10, region, type, currency } = options;

    const cacheKey = normalizedQuery.toLowerCase();
    const cachedResults = getCachedValue(
      searchCache,
      cacheKey,
      SEARCH_CACHE_TTL_MS,
    );

    const applyFilters = (items) => {
      return items.filter((item) => {
        if (region && item.region?.toLowerCase() !== region.toLowerCase()) {
          return false;
        }
        if (type && item.type?.toLowerCase() !== type.toLowerCase()) {
          return false;
        }
        if (
          currency &&
          item.currency?.toLowerCase() !== currency.toLowerCase()
        ) {
          return false;
        }
        return true;
      });
    };

    let source = "Mock";
    let fullResults = cachedResults;

    if (!fullResults && hasAlphaVantageKey()) {
      try {
        const data = await fetchAlphaVantage({
          function: "SYMBOL_SEARCH",
          keywords: normalizedQuery,
        });

        const matches = data.bestMatches || [];
        fullResults = matches.map((match) => ({
          symbol: match["1. symbol"],
          name: match["2. name"],
          type: match["3. type"],
          region: match["4. region"],
          currency: match["8. currency"],
          source: "Alpha Vantage",
        }));
        source = "Alpha Vantage";
      } catch (error) {
        // Fall back to mock search below.
      }
    }

    if (!fullResults) {
      fullResults = mockStocks
        .filter(
          (stock) =>
            stock.symbol.toLowerCase().includes(cacheKey) ||
            stock.name.toLowerCase().includes(cacheKey),
        )
        .map((stock) => ({
          symbol: stock.symbol,
          name: stock.name,
          type: "Equity",
          region: "US",
          currency: "USD",
          source: "Mock",
        }));
      source = "Mock";
    }

    setCachedValue(searchCache, cacheKey, fullResults);

    const filtered = applyFilters(fullResults);
    const total = filtered.length;
    const normalizedPage = Math.max(1, Number.parseInt(page, 10) || 1);
    const normalizedPageSize = Math.max(1, Number.parseInt(pageSize, 10) || 10);
    const start = (normalizedPage - 1) * normalizedPageSize;
    const items = filtered.slice(start, start + normalizedPageSize);

    return {
      items,
      total,
      page: normalizedPage,
      pageSize: normalizedPageSize,
      source,
    };
  } catch (error) {
    throw error;
  }
};
