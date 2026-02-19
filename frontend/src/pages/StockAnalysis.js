import React, { useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { stockService } from "../services/api";
import TechnicalChart from "../components/TechnicalChart";
import useLiveRefresh from "../hooks/useLiveRefresh";

const StockAnalysis = () => {
  const { symbol } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState([]);
  const [newsSummary, setNewsSummary] = useState(null);
  const [newsSource, setNewsSource] = useState("");

  const fetchAnalysis = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        }
        const data = await stockService.getTechnicalAnalysis(symbol);
        setAnalysis(data);
      } catch (error) {
        console.error("Error fetching analysis:", error);
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [symbol],
  );

  const fetchNews = useCallback(async () => {
    try {
      const data = await stockService.getNews(symbol);
      setNews(data.items || []);
      setNewsSummary(data.summary || null);
      setNewsSource(data.source || "");
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  }, [symbol]);

  const { lastUpdated, refreshing } = useLiveRefresh(
    async () => {
      await Promise.all([fetchAnalysis(false), fetchNews()]);
    },
    {
      intervalMs: 20000,
      enabled: Boolean(symbol),
      runOnMount: true,
      streamInclude: ["heartbeat", "analysis"],
      streamSymbol: symbol,
    },
  );

  if (loading)
    return <div className="text-center py-12">Loading analysis...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{symbol} Technical Analysis</h1>
        <p className="text-sm text-gray-500 mt-1">
          Last updated:{" "}
          {lastUpdated ? lastUpdated.toLocaleTimeString() : "Syncing..."}
          {refreshing ? " • Updating" : ""}
        </p>
      </div>

      {/* Technical Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">RSI (14)</p>
          <p className="text-2xl font-bold text-blue-600">
            {analysis?.rsi?.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {analysis?.rsi > 70
              ? "Overbought"
              : analysis?.rsi < 30
                ? "Oversold"
                : "Neutral"}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">MACD</p>
          <p className="text-2xl font-bold text-blue-600">
            {analysis?.macd?.toFixed(4)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {analysis?.macd > 0 ? "Bullish" : "Bearish"}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Volume</p>
          <p className="text-2xl font-bold text-blue-600">
            {analysis?.volume?.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">{analysis?.volumeSignal}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Moving Avg (50)</p>
          <p className="text-2xl font-bold text-blue-600">
            ${analysis?.sma50?.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">{analysis?.priceVsSMA}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <TechnicalChart symbol={symbol} data={analysis} />
      </div>

      {/* Sentiment Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">News Sentiment</h3>
          {newsSummary && (
            <p className="text-xs text-gray-500 mb-3">
              Source: {newsSource || "News"}
            </p>
          )}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Positive</span>
              <span className="font-bold text-green-600">
                {newsSummary?.positive ?? analysis?.newsSentiment?.positive}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Neutral</span>
              <span className="font-bold text-gray-600">
                {newsSummary?.neutral ?? analysis?.newsSentiment?.neutral}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Negative</span>
              <span className="font-bold text-red-600">
                {newsSummary?.negative ?? analysis?.newsSentiment?.negative}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Social Media Sentiment</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Positive</span>
              <span className="font-bold text-green-600">
                {analysis?.socialSentiment?.positive}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Neutral</span>
              <span className="font-bold text-gray-600">
                {analysis?.socialSentiment?.neutral}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Negative</span>
              <span className="font-bold text-red-600">
                {analysis?.socialSentiment?.negative}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* News Feed */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">Latest News</h3>
        {news.length === 0 ? (
          <p className="text-gray-500">No news available.</p>
        ) : (
          <div className="space-y-4">
            {news.map((item) => (
              <a
                key={item.url}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="block border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.source} •{" "}
                      {new Date(item.publishedAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      item.sentiment?.label === "positive"
                        ? "bg-green-100 text-green-700"
                        : item.sentiment?.label === "negative"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {item.sentiment?.label || "neutral"}
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StockAnalysis;
