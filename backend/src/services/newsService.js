const axios = require("axios");
const stockService = require("./stockService");

const NEWS_API_URL = "https://newsapi.org/v2/everything";
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const ML_SERVICE_URL = process.env.ML_SERVICE_URL;

const buildQuery = (symbol, companyName) => {
  const base = symbol ? symbol.toUpperCase() : "";
  if (companyName) {
    return `${base} OR "${companyName}"`;
  }
  return base;
};

const analyzeSentiment = async (text) => {
  if (!ML_SERVICE_URL) {
    return { label: "neutral", compound: 0 };
  }

  try {
    const response = await axios.post(
      `${ML_SERVICE_URL}/api/analyze/sentiment`,
      {
        text,
        source: "news",
      },
    );
    return response.data?.sentiment || { label: "neutral", compound: 0 };
  } catch (error) {
    return { label: "neutral", compound: 0 };
  }
};

exports.getNewsWithSentiment = async (symbol, limit = 8) => {
  if (!NEWS_API_KEY || NEWS_API_KEY === "your_news_api_key") {
    return {
      source: "Mock",
      items: [
        {
          title: `${symbol} shows steady momentum`,
          url: "#",
          source: "Mock News",
          publishedAt: new Date().toISOString(),
          sentiment: { label: "neutral", compound: 0 },
        },
      ],
      summary: {
        positive: 0,
        neutral: 100,
        negative: 0,
      },
    };
  }

  const quote = await stockService.getStockBySymbol(symbol);
  const query = buildQuery(symbol, quote?.name);

  const response = await axios.get(NEWS_API_URL, {
    params: {
      q: query,
      sortBy: "publishedAt",
      language: "en",
      pageSize: limit,
      apiKey: NEWS_API_KEY,
    },
  });

  const articles = response.data?.articles || [];
  const sentimentResults = await Promise.all(
    articles.map((article) => {
      const text = `${article.title || ""}. ${article.description || ""}`;
      return analyzeSentiment(text);
    }),
  );

  const items = articles.map((article, index) => ({
    title: article.title,
    url: article.url,
    source: article.source?.name || "News",
    publishedAt: article.publishedAt,
    sentiment: sentimentResults[index],
  }));

  const summary = items.reduce(
    (acc, item) => {
      const label = item.sentiment?.label || "neutral";
      if (label === "positive") acc.positive += 1;
      if (label === "negative") acc.negative += 1;
      if (label === "neutral") acc.neutral += 1;
      return acc;
    },
    { positive: 0, neutral: 0, negative: 0 },
  );

  const total = items.length || 1;
  const summaryPct = {
    positive: Math.round((summary.positive / total) * 100),
    neutral: Math.round((summary.neutral / total) * 100),
    negative: Math.round((summary.negative / total) * 100),
  };

  return {
    source: "NewsAPI.org",
    items,
    summary: summaryPct,
  };
};
