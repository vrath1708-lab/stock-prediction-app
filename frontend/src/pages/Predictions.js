import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { stockService } from "../services/api";
import useLiveRefresh from "../hooks/useLiveRefresh";

const Predictions = () => {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState(null);

  const fetchData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      const stocksData = await stockService.getTopStocks();
      setStocks(stocksData);

      // Fetch predictions for all stocks
      const predictionsData = await Promise.all(
        stocksData.map((stock) =>
          stockService.getPrediction(stock.symbol).catch(() => null),
        ),
      );
      setPredictions(predictionsData.filter((p) => p !== null));
    } catch (error) {
      console.error("Error fetching predictions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const { lastUpdated, refreshing } = useLiveRefresh(() => fetchData(false), {
    intervalMs: 20000,
    enabled: true,
    runOnMount: true,
    streamInclude: ["heartbeat", "stocks"],
  });

  const getPredictionBySymbol = (symbol) => {
    return predictions.find((p) => p.symbol === symbol);
  };

  const groupedStocks = {
    "STRONG BUY": stocks.filter(
      (s) => s.signal === "BUY" && s.confidence >= 80,
    ),
    BUY: stocks.filter((s) => s.signal === "BUY" && s.confidence < 80),
    HOLD: stocks.filter((s) => s.signal === "HOLD"),
    SELL: stocks.filter((s) => s.signal === "SELL"),
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Loading predictions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-8 rounded-lg">
        <h1 className="text-4xl font-bold mb-2">AI Stock Predictions</h1>
        <p className="text-purple-100">
          Machine learning-powered buy and sell recommendations
        </p>
        <p className="text-purple-100 text-sm mt-2">
          Last updated:{" "}
          {lastUpdated ? lastUpdated.toLocaleTimeString() : "Syncing..."}
          {refreshing ? " • Updating" : ""}
        </p>
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strong Buy */}
        <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-green-500">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-3xl">🚀</span> Strong Buy
          </h3>
          <p className="text-gray-600 mb-4">High confidence buy signals</p>
          <div className="space-y-3">
            {groupedStocks["STRONG BUY"].length > 0 ? (
              groupedStocks["STRONG BUY"].map((stock) => {
                const prediction = getPredictionBySymbol(stock.symbol);
                return (
                  <div
                    key={stock.symbol}
                    className="bg-green-50 p-4 rounded-lg cursor-pointer hover:bg-green-100 transition"
                    onClick={() => navigate(`/analysis/${stock.symbol}`)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-lg">{stock.symbol}</p>
                        <p className="text-sm text-gray-600">{stock.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          {stock.confidence.toFixed(1)}%
                        </p>
                        {prediction && (
                          <p className="text-xs text-gray-500">
                            Target: ${prediction.targetPrice}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-400 italic">
                No strong buy signals at this time
              </p>
            )}
          </div>
        </div>

        {/* Buy */}
        <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-blue-500">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-3xl">📈</span> Buy
          </h3>
          <p className="text-gray-600 mb-4">Positive growth potential</p>
          <div className="space-y-3">
            {groupedStocks["BUY"].length > 0 ? (
              groupedStocks["BUY"].map((stock) => {
                const prediction = getPredictionBySymbol(stock.symbol);
                return (
                  <div
                    key={stock.symbol}
                    className="bg-blue-50 p-4 rounded-lg cursor-pointer hover:bg-blue-100 transition"
                    onClick={() => navigate(`/analysis/${stock.symbol}`)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-lg">{stock.symbol}</p>
                        <p className="text-sm text-gray-600">{stock.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">
                          {stock.confidence.toFixed(1)}%
                        </p>
                        {prediction && (
                          <p className="text-xs text-gray-500">
                            Target: ${prediction.targetPrice}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-400 italic">
                No buy signals at this time
              </p>
            )}
          </div>
        </div>

        {/* Hold */}
        <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-yellow-500">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-3xl">⏸️</span> Hold
          </h3>
          <p className="text-gray-600 mb-4">Maintain current positions</p>
          <div className="space-y-3">
            {groupedStocks["HOLD"].length > 0 ? (
              groupedStocks["HOLD"].map((stock) => (
                <div
                  key={stock.symbol}
                  className="bg-yellow-50 p-4 rounded-lg cursor-pointer hover:bg-yellow-100 transition"
                  onClick={() => navigate(`/analysis/${stock.symbol}`)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-lg">{stock.symbol}</p>
                      <p className="text-sm text-gray-600">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-yellow-600">
                        {stock.confidence.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 italic">No hold recommendations</p>
            )}
          </div>
        </div>

        {/* Sell */}
        <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-red-500">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-3xl">📉</span> Sell
          </h3>
          <p className="text-gray-600 mb-4">Consider selling these positions</p>
          <div className="space-y-3">
            {groupedStocks["SELL"].length > 0 ? (
              groupedStocks["SELL"].map((stock) => (
                <div
                  key={stock.symbol}
                  className="bg-red-50 p-4 rounded-lg cursor-pointer hover:bg-red-100 transition"
                  onClick={() => navigate(`/analysis/${stock.symbol}`)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-lg">{stock.symbol}</p>
                      <p className="text-sm text-gray-600">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">
                        {stock.confidence.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 italic">
                No sell signals at this time
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Prediction Details Modal */}
      {selectedStock && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedStock(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">
              {selectedStock.symbol} Prediction Details
            </h2>
            <button
              onClick={() => setSelectedStock(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            {/* Add prediction details here */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Predictions;
