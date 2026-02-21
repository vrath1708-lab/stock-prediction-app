import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { stockService } from "../services/api";
import useLiveRefresh from "../hooks/useLiveRefresh";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

const PredictionHistory = () => {
  const [predictions, setPredictions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stats");
  const [intradaySymbols, setIntradaySymbols] = useState([]);
  const [intradayTicks, setIntradayTicks] = useState({});
  const [intradayLoading, setIntradayLoading] = useState(true);
  const [intradayError, setIntradayError] = useState("");
  const [selectedIntradaySymbol, setSelectedIntradaySymbol] = useState("AAPL");

  const fetchData = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
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

  const { lastUpdated, refreshing } = useLiveRefresh(() => fetchData(false), {
    intervalMs: 20000,
    enabled: true,
    runOnMount: true,
  });

  const trackedSymbols = useMemo(() => {
    const symbolsFromHistory = [...new Set(predictions.map((p) => p.symbol))];
    const fallback = ["AAPL", "MSFT", "NVDA", "GOOGL", "TSLA"];
    return [...new Set([...symbolsFromHistory, ...fallback, ...intradaySymbols])];
  }, [intradaySymbols, predictions]);

  const fetchIntradayUniverse = useCallback(async () => {
    try {
      const topStocks = await stockService.getTopStocks();
      const symbols = (topStocks || []).map((stock) => stock.symbol).filter(Boolean);
      setIntradaySymbols(symbols);
    } catch (error) {
      console.error("Error fetching intraday universe:", error);
    }
  }, []);

  const fetchIntradayTicks = useCallback(async () => {
    if (trackedSymbols.length === 0) return;

    try {
      setIntradayError("");
      const results = await Promise.allSettled(
        trackedSymbols.map((symbol) => stockService.getStockBySymbol(symbol)),
      );

      const now = new Date();
      setIntradayTicks((previous) => {
        const next = { ...previous };
        results.forEach((result, index) => {
          if (result.status !== "fulfilled") {
            return;
          }
          const quote = result.value;
          const symbol = trackedSymbols[index];
          const point = {
            ts: now,
            price: Number(quote?.price || 0),
            change: Number(quote?.change || 0),
            volume: Number(quote?.volume || 0),
            source: quote?.source || "Unknown",
          };
          const history = next[symbol] ? [...next[symbol], point] : [point];
          next[symbol] = history.slice(-60);
        });
        return next;
      });
    } catch (error) {
      console.error("Error fetching intraday ticks:", error);
      setIntradayError("Unable to fetch intraday ticks right now.");
    } finally {
      setIntradayLoading(false);
    }
  }, [trackedSymbols]);

  const { lastUpdated: intradayUpdated, refreshing: intradayRefreshing } =
    useLiveRefresh(() => fetchIntradayTicks(), {
      intervalMs: 15000,
      enabled: activeTab === "intraday" && trackedSymbols.length > 0,
      runOnMount: true,
      useServerPush: false,
    });

  const selectedPoints = useMemo(
    () => intradayTicks[selectedIntradaySymbol] || [],
    [intradayTicks, selectedIntradaySymbol],
  );
  const selectedLatest = selectedPoints[selectedPoints.length - 1];
  const selectedHigh = selectedPoints.length
    ? Math.max(...selectedPoints.map((point) => point.price))
    : null;
  const selectedLow = selectedPoints.length
    ? Math.min(...selectedPoints.map((point) => point.price))
    : null;

  const intradayChartData = useMemo(
    () => ({
      labels: selectedPoints.map((point) =>
        point.ts.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      ),
      datasets: [
        {
          label: `${selectedIntradaySymbol} Price`,
          data: selectedPoints.map((point) => point.price),
          borderColor: "#7c3aed",
          backgroundColor: "rgba(124, 58, 237, 0.15)",
          tension: 0.25,
          pointRadius: 0,
          fill: true,
        },
      ],
    }),
    [selectedIntradaySymbol, selectedPoints],
  );

  useEffect(() => {
    if (activeTab === "intraday") {
      setIntradayLoading(true);
      fetchIntradayUniverse();
    }
  }, [activeTab, fetchIntradayUniverse]);

  useEffect(() => {
    if (trackedSymbols.length === 0) return;
    if (!trackedSymbols.includes(selectedIntradaySymbol)) {
      setSelectedIntradaySymbol(trackedSymbols[0]);
    }
  }, [selectedIntradaySymbol, trackedSymbols]);

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
        <p className="text-purple-100 text-sm mt-2">
          Last updated:{" "}
          {lastUpdated ? lastUpdated.toLocaleTimeString() : "Syncing..."}
          {refreshing ? " • Updating" : ""}
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
        <button
          onClick={() => {
            setActiveTab("intraday");
            setIntradayLoading(true);
            setIntradayTicks({});
          }}
          className={`px-4 py-2 font-semibold ${
            activeTab === "intraday"
              ? "text-purple-600 border-b-2 border-purple-600"
              : "text-gray-600"
          }`}
        >
          Intraday Tracker
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

      {activeTab === "intraday" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Tracking</span>
              <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                {trackedSymbols.length} symbols
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Last tick: {intradayUpdated ? intradayUpdated.toLocaleTimeString() : "Syncing..."}
              {intradayRefreshing ? " • Updating" : ""}
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg shadow">
            {intradayLoading ? (
              <div className="text-center text-gray-500 py-10">Loading intraday tracker...</div>
            ) : trackedSymbols.length === 0 ? (
              <div className="text-center text-gray-500 py-10">No intraday symbols available.</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                  <div className="border border-gray-200 rounded-lg divide-y">
                    <div className="px-3 py-2 text-xs text-gray-500">
                      Click a symbol to view its intraday chart
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {trackedSymbols.map((symbol) => {
                        const points = intradayTicks[symbol] || [];
                        const latest = points[points.length - 1];
                        const isActive = symbol === selectedIntradaySymbol;
                        return (
                          <button
                            key={symbol}
                            type="button"
                            onClick={() => setSelectedIntradaySymbol(symbol)}
                            className={`w-full px-3 py-2 text-left transition ${
                              isActive
                                ? "bg-purple-50 text-purple-700"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold">{symbol}</p>
                                <p className="text-xs text-gray-500">
                                  {latest?.source || "Unknown"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold">
                                  {latest ? `$${latest.price.toFixed(2)}` : "-"}
                                </p>
                                <p
                                  className={`text-xs font-semibold ${
                                    latest?.change >= 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {latest
                                    ? `${latest.change >= 0 ? "+" : ""}${latest.change.toFixed(2)}%`
                                    : "-"}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <div className="border border-gray-200 rounded-lg p-3 h-80">
                    {selectedPoints.length === 0 ? (
                      <div className="text-center text-gray-500 py-10">
                        No intraday data for {selectedIntradaySymbol} yet.
                      </div>
                    ) : (
                      <Line
                        data={intradayChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                            tooltip: { mode: "index", intersect: false },
                          },
                          scales: {
                            x: { grid: { display: false }, ticks: { maxTicksLimit: 8 } },
                            y: { ticks: { callback: (value) => `$${value}` } },
                          },
                        }}
                      />
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-500">Latest</p>
                      <p className="text-lg font-bold text-gray-900">
                        {selectedLatest ? `$${selectedLatest.price.toFixed(2)}` : "-"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-500">Session High</p>
                      <p className="text-lg font-bold text-gray-900">
                        {selectedHigh !== null ? `$${selectedHigh.toFixed(2)}` : "-"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-500">Session Low</p>
                      <p className="text-lg font-bold text-gray-900">
                        {selectedLow !== null ? `$${selectedLow.toFixed(2)}` : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {intradayError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg">
              {intradayError}
            </div>
          )}
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
