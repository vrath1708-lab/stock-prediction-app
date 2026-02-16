import React, { useState, useEffect } from "react";
import { stockService } from "../services/api";

const PredictionHistory = () => {
  const [predictions, setPredictions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stats");

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [predictionsData, statsData] = await Promise.all([
        stockService.getPredictionHistory(),
        stockService.getPredictionStats(),
      ]);
      setPredictions(predictionsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching prediction data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading prediction data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-8 rounded-lg">
        <h1 className="text-4xl font-bold mb-2">Prediction Tracker</h1>
        <p className="text-purple-100">
          Monitor prediction accuracy and performance over time
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-4 py-2 font-semibold ${
            activeTab === "stats"
              ? "text-purple-600 border-b-2 border-purple-600"
              : "text-gray-600"
          }`}
        >
          Accuracy Stats
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 font-semibold ${
            activeTab === "history"
              ? "text-purple-600 border-b-2 border-purple-600"
              : "text-gray-600"
          }`}
        >
          Prediction History
        </button>
      </div>

      {/* Stats Tab */}
      {activeTab === "stats" && stats && (
        <div className="space-y-6">
          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">7-Day Performance</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Accuracy:</span>
                  <span className="font-bold text-green-600">
                    {stats.overall7d?.accuracy || 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Return:</span>
                  <span
                    className={`font-bold ${
                      (stats.overall7d?.avgReturn || 0) > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {(stats.overall7d?.avgReturn || 0).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">30-Day Performance</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Accuracy:</span>
                  <span className="font-bold text-green-600">
                    {stats.overall30d?.accuracy || 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Return:</span>
                  <span
                    className={`font-bold ${
                      (stats.overall30d?.avgReturn || 0) > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {(stats.overall30d?.avgReturn || 0).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Signal Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-3">BUY Signals</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-600">Total:</span>{" "}
                  <span className="font-bold">{stats.buy?.count || 0}</span>
                </p>
                <p>
                  <span className="text-gray-600">Wins:</span>{" "}
                  <span className="font-bold text-green-600">
                    {stats.buy?.wins || 0}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">Accuracy:</span>{" "}
                  <span className="font-bold">{stats.buy?.accuracy || 0}%</span>
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-900 mb-3">
                HOLD Signals
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-600">Total:</span>{" "}
                  <span className="font-bold">{stats.hold?.count || 0}</span>
                </p>
                <p>
                  <span className="text-gray-600">Wins:</span>{" "}
                  <span className="font-bold text-green-600">
                    {stats.hold?.wins || 0}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">Accuracy:</span>{" "}
                  <span className="font-bold">
                    {stats.hold?.accuracy || 0}%
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-red-50 p-6 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-900 mb-3">SELL Signals</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-600">Total:</span>{" "}
                  <span className="font-bold">{stats.sell?.count || 0}</span>
                </p>
                <p>
                  <span className="text-gray-600">Wins:</span>{" "}
                  <span className="font-bold text-green-600">
                    {stats.sell?.wins || 0}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">Accuracy:</span>{" "}
                  <span className="font-bold">
                    {stats.sell?.accuracy || 0}%
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="bg-white rounded-lg shadow">
          {predictions.length === 0 ? (
            <div className="px-4 sm:px-6 py-8 text-center text-gray-500">
              No predictions yet
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900">
                        Symbol
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900">
                        Signal
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900">
                        Confidence
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900">
                        Entry Price
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900">
                        Return (7d)
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900">
                        Outcome (7d)
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900">
                        Return (30d)
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900">
                        Outcome (30d)
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.map((pred) => (
                      <tr
                        key={pred._id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-3 sm:px-6 py-4 font-semibold text-gray-900 text-sm">
                          {pred.symbol}
                        </td>
                        <td className="px-3 sm:px-6 py-4">
                          <span
                            className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                              pred.signal === "BUY"
                                ? "bg-green-100 text-green-900"
                                : pred.signal === "SELL"
                                  ? "bg-red-100 text-red-900"
                                  : "bg-yellow-100 text-yellow-900"
                            }`}
                          >
                            {pred.signal}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <div className="w-12 sm:w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${pred.confidence}%` }}
                              />
                            </div>
                            <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">
                              {pred.confidence}%
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 text-sm">
                          ${pred.entryPrice.toFixed(2)}
                        </td>
                        <td className="px-3 sm:px-6 py-4">
                          {pred.returnPercent7d ? (
                            <span
                              className={`font-semibold text-sm ${
                                pred.returnPercent7d > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {pred.returnPercent7d > 0 ? "+" : ""}
                              {pred.returnPercent7d.toFixed(2)}%
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-3 sm:px-6 py-4">
                          {pred.outcome7d === "WIN" ? (
                            <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-green-100 text-green-900">
                              WIN
                            </span>
                          ) : pred.outcome7d === "LOSS" ? (
                            <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-red-100 text-red-900">
                              LOSS
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs sm:text-sm">
                              PENDING
                            </span>
                          )}
                        </td>
                        <td className="px-3 sm:px-6 py-4">
                          {pred.returnPercent30d ? (
                            <span
                              className={`font-semibold text-sm ${
                                pred.returnPercent30d > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {pred.returnPercent30d > 0 ? "+" : ""}
                              {pred.returnPercent30d.toFixed(2)}%
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-3 sm:px-6 py-4">
                          {pred.outcome30d === "WIN" ? (
                            <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-green-100 text-green-900">
                              WIN
                            </span>
                          ) : pred.outcome30d === "LOSS" ? (
                            <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-red-100 text-red-900">
                              LOSS
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs sm:text-sm">
                              PENDING
                            </span>
                          )}
                        </td>
                        <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-600">
                          {new Date(pred.entryDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3 p-4">
                {predictions.map((pred) => (
                  <div
                    key={pred._id}
                    className="border border-gray-200 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-lg text-gray-900">
                          {pred.symbol}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {new Date(pred.entryDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          pred.signal === "BUY"
                            ? "bg-green-100 text-green-900"
                            : pred.signal === "SELL"
                              ? "bg-red-100 text-red-900"
                              : "bg-yellow-100 text-yellow-900"
                        }`}
                      >
                        {pred.signal}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-600">Entry Price</p>
                        <p className="font-semibold">
                          ${pred.entryPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-600">Confidence</p>
                        <p className="font-semibold">{pred.confidence}%</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">7-Day</p>
                        <p
                          className={`font-semibold ${
                            pred.returnPercent7d > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {pred.returnPercent7d
                            ? `${pred.returnPercent7d > 0 ? "+" : ""}${pred.returnPercent7d.toFixed(2)}%`
                            : "-"}
                        </p>
                        {pred.outcome7d && (
                          <p
                            className={`text-xs font-semibold ${
                              pred.outcome7d === "WIN"
                                ? "text-green-600"
                                : pred.outcome7d === "LOSS"
                                  ? "text-red-600"
                                  : "text-gray-400"
                            }`}
                          >
                            {pred.outcome7d}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">30-Day</p>
                        <p
                          className={`font-semibold ${
                            pred.returnPercent30d > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {pred.returnPercent30d
                            ? `${pred.returnPercent30d > 0 ? "+" : ""}${pred.returnPercent30d.toFixed(2)}%`
                            : "-"}
                        </p>
                        {pred.outcome30d && (
                          <p
                            className={`text-xs font-semibold ${
                              pred.outcome30d === "WIN"
                                ? "text-green-600"
                                : pred.outcome30d === "LOSS"
                                  ? "text-red-600"
                                  : "text-gray-400"
                            }`}
                          >
                            {pred.outcome30d}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PredictionHistory;
