import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { stockService } from "../services/api";

const Portfolio = () => {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trade, setTrade] = useState({ symbol: "", shares: "", type: "BUY" });
  const [portfolioError, setPortfolioError] = useState("");
  const isAuthed = Boolean(localStorage.getItem("authToken"));

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await stockService.getPortfolioRecommendations();
      setRecommendations(data);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPortfolio = useCallback(async () => {
    try {
      setPortfolioError("");
      const data = await stockService.getPortfolio();
      setPortfolio(data);
    } catch (error) {
      setPortfolioError("Login required to view portfolio simulator.");
      setPortfolio(null);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  useEffect(() => {
    if (isAuthed) {
      fetchPortfolio();
    }
  }, [fetchPortfolio, isAuthed]);

  const handleTrade = async (event) => {
    event.preventDefault();
    try {
      setPortfolioError("");
      const payload = {
        symbol: trade.symbol.toUpperCase(),
        shares: Number(trade.shares),
      };
      const data =
        trade.type === "BUY"
          ? await stockService.buyStock(payload)
          : await stockService.sellStock(payload);
      setPortfolio(data);
      setTrade({ symbol: "", shares: "", type: trade.type });
    } catch (error) {
      setPortfolioError(
        error.response?.data?.error?.message || "Trade failed.",
      );
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case "BUY":
        return "text-green-600 bg-green-100";
      case "SELL":
        return "text-red-600 bg-red-100";
      case "HOLD":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case "BUY":
        return "📈";
      case "SELL":
        return "📉";
      case "HOLD":
        return "⏸️";
      default:
        return "📊";
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Loading portfolio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-8 rounded-lg">
        <h1 className="text-4xl font-bold mb-2">Portfolio Management</h1>
        <p className="text-indigo-100">
          AI-powered recommendations for your investment portfolio
        </p>
      </div>

      {/* Portfolio Summary */}
      {recommendations?.summary && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Portfolio Summary</h3>
          <p className="text-gray-700">{recommendations.summary}</p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {new Date(recommendations.timestamp).toLocaleString()}
          </p>
        </div>
      )}

      {/* Portfolio Simulator */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold">Portfolio Simulator</h3>
          {!isAuthed && (
            <button
              onClick={() => navigate("/auth")}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Login to Trade
            </button>
          )}
        </div>

        {portfolioError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg">
            {portfolioError}
          </div>
        )}

        {portfolio && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500">Cash</p>
              <p className="text-2xl font-bold">${portfolio.cash.toFixed(2)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500">Holdings Value</p>
              <p className="text-2xl font-bold">
                ${portfolio.holdingsValue.toFixed(2)}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-2xl font-bold">
                ${portfolio.totalValue.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {isAuthed && (
          <form
            onSubmit={handleTrade}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <input
              type="text"
              value={trade.symbol}
              onChange={(event) =>
                setTrade((prev) => ({ ...prev, symbol: event.target.value }))
              }
              placeholder="Symbol"
              className="px-3 py-2 border rounded-lg"
              required
            />
            <input
              type="number"
              value={trade.shares}
              onChange={(event) =>
                setTrade((prev) => ({ ...prev, shares: event.target.value }))
              }
              placeholder="Shares"
              className="px-3 py-2 border rounded-lg"
              required
            />
            <select
              value={trade.type}
              onChange={(event) =>
                setTrade((prev) => ({ ...prev, type: event.target.value }))
              }
              className="px-3 py-2 border rounded-lg"
            >
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
            <button
              type="submit"
              className="bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Execute
            </button>
          </form>
        )}

        {portfolio?.holdings?.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-lg font-semibold">Holdings</h4>
            {portfolio.holdings.map((holding) => (
              <div
                key={holding.symbol}
                className="border border-gray-200 rounded-lg p-4 flex justify-between"
              >
                <div>
                  <div className="font-semibold">{holding.symbol}</div>
                  <div className="text-xs text-gray-500">
                    {holding.shares} shares • Avg ${holding.avgCost.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    ${holding.marketValue.toFixed(2)}
                  </div>
                  <div
                    className={`text-xs ${
                      holding.unrealized >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {holding.unrealized >= 0 ? "+" : ""}
                    {holding.unrealized.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-2xl font-bold mb-6">Recommended Actions</h3>
        <div className="space-y-4">
          {recommendations?.recommendations?.map((rec, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition cursor-pointer"
              onClick={() => navigate(`/analysis/${rec.symbol}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">
                      {getActionIcon(rec.action)}
                    </span>
                    <div>
                      <h4 className="text-xl font-bold">{rec.symbol}</h4>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getActionColor(rec.action)}`}
                      >
                        {rec.action}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 mt-2">{rec.reason}</p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-sm text-gray-500 mb-1">Confidence</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {(rec.confidence * 100).toFixed(0)}%
                  </div>
                  <div className="mt-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${rec.confidence * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow">
          <div className="text-3xl mb-2">📈</div>
          <div className="text-3xl font-bold">
            {recommendations?.recommendations?.filter((r) => r.action === "BUY")
              .length || 0}
          </div>
          <div className="text-green-100">Buy Opportunities</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-lg shadow">
          <div className="text-3xl mb-2">⏸️</div>
          <div className="text-3xl font-bold">
            {recommendations?.recommendations?.filter(
              (r) => r.action === "HOLD",
            ).length || 0}
          </div>
          <div className="text-yellow-100">Hold Positions</div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-lg shadow">
          <div className="text-3xl mb-2">📉</div>
          <div className="text-3xl font-bold">
            {recommendations?.recommendations?.filter(
              (r) => r.action === "SELL",
            ).length || 0}
          </div>
          <div className="text-red-100">Sell Recommendations</div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              These recommendations are based on technical analysis, sentiment
              data, and machine learning predictions. Always conduct your own
              research before making investment decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
