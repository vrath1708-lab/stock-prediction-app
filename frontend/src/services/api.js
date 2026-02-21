import axios from "axios";

const isLocalDev =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

const defaultApiBaseUrl = isLocalDev ? "http://localhost:5000/api" : "/api";

const normalizeApiBaseUrl = (url) => {
  const sanitized = (url || "").trim().replace(/\/+$/, "");
  if (!sanitized) {
    return defaultApiBaseUrl;
  }

  if (sanitized.startsWith("/")) {
    return sanitized;
  }

  try {
    const parsed = new URL(sanitized);
    if (!parsed.pathname || parsed.pathname === "/") {
      return `${parsed.origin}/api`;
    }
  } catch (error) {
    return sanitized;
  }

  return sanitized;
};

export const API_BASE_URL =
  normalizeApiBaseUrl(process.env.REACT_APP_API_URL || defaultApiBaseUrl);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const stockService = {
  getTopStocks: () => api.get("/stocks/top").then((res) => res.data),

  getStockBySymbol: (symbol) =>
    api.get(`/stocks/${symbol}`).then((res) => res.data),

  searchSymbols: (query, params = {}) => {
    const queryParams = new URLSearchParams({
      query,
      ...(params.page ? { page: params.page } : {}),
      ...(params.pageSize ? { pageSize: params.pageSize } : {}),
      ...(params.region ? { region: params.region } : {}),
      ...(params.type ? { type: params.type } : {}),
      ...(params.currency ? { currency: params.currency } : {}),
    });

    return api
      .get(`/stocks/search?${queryParams.toString()}`)
      .then((res) => res.data);
  },

  getHistoricalData: (symbol, days = 30) =>
    api
      .get(`/stocks/${symbol}/historical?days=${days}`)
      .then((res) => res.data),

  getTechnicalAnalysis: (symbol) =>
    api.get(`/analysis/technical/${symbol}`).then((res) => res.data),

  getRSI: (symbol) =>
    api.get(`/analysis/rsi/${symbol}`).then((res) => res.data),

  getMACD: (symbol) =>
    api.get(`/analysis/macd/${symbol}`).then((res) => res.data),

  getVolume: (symbol) =>
    api.get(`/analysis/volume/${symbol}`).then((res) => res.data),

  getSentiment: (symbol) =>
    api.get(`/sentiment/${symbol}`).then((res) => res.data),

  getNews: (symbol) =>
    api.get(`/news/${symbol}`, { timeout: 20000 }).then((res) => res.data),

  getPrediction: (symbol) =>
    api.get(`/predictions/${symbol}`).then((res) => res.data),

  getPortfolioRecommendations: () =>
    api.get(`/predictions/portfolio/recommendations`).then((res) => res.data),

  register: (payload) =>
    api.post("/auth/register", payload).then((res) => res.data),
  login: (payload) => api.post("/auth/login", payload).then((res) => res.data),
  me: () => api.get("/auth/me").then((res) => res.data),

  getPortfolio: () => api.get("/portfolio").then((res) => res.data),
  buyStock: (payload) =>
    api.post("/portfolio/buy", payload).then((res) => res.data),
  sellStock: (payload) =>
    api.post("/portfolio/sell", payload).then((res) => res.data),

  runBacktest: (payload) =>
    api.post("/backtest", payload).then((res) => res.data),

  getPredictionHistory: () =>
    api.get("/predictions/history/all").then((res) => res.data),

  getPredictionStats: () =>
    api.get("/predictions/history/stats").then((res) => res.data),

  getPredictionsBySymbol: (symbol) =>
    api.get(`/predictions/history/symbol/${symbol}`).then((res) => res.data),

  logPrediction: (payload) =>
    api.post("/predictions/history", payload).then((res) => res.data),

  getAlertSettings: () => api.get("/alerts/settings").then((res) => res.data),

  updateAlertSettings: (payload) =>
    api.put("/alerts/settings", payload).then((res) => res.data),

  muteAlerts: (minutes = 60) =>
    api.post("/alerts/mute", { minutes }).then((res) => res.data),

  processAlerts: () => api.post("/alerts/process").then((res) => res.data),
};

export default api;
