import React, { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { stockService } from "../services/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

const Backtest = () => {
  const [symbol, setSymbol] = useState("AAPL");
  const [fastPeriod, setFastPeriod] = useState(20);
  const [slowPeriod, setSlowPeriod] = useState(50);
  const [initialCash, setInitialCash] = useState(10000);
  const [days, setDays] = useState(200);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runBacktest = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError("");
      const data = await stockService.runBacktest({
        symbol,
        fastPeriod,
        slowPeriod,
        initialCash,
        days,
      });
      setResult(data);
    } catch (err) {
      setError("Backtest failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const chartData = result
    ? {
        labels: result.equityCurve.map((point) => point.date),
        datasets: [
          {
            label: "Equity",
            data: result.equityCurve.map((point) => point.equity),
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            tension: 0.3,
            pointRadius: 0,
          },
        ],
      }
    : null;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-8 rounded-lg">
        <h1 className="text-4xl font-bold mb-2">Strategy Backtester</h1>
        <p className="text-emerald-100">
          Run SMA crossover backtests with historical data.
        </p>
      </div>

      <form
        onSubmit={runBacktest}
        className="bg-white p-6 rounded-lg shadow grid grid-cols-1 md:grid-cols-5 gap-4"
      >
        <input
          type="text"
          value={symbol}
          onChange={(event) => setSymbol(event.target.value.toUpperCase())}
          className="px-3 py-2 border rounded-lg"
          placeholder="Symbol"
        />
        <input
          type="number"
          value={fastPeriod}
          onChange={(event) => setFastPeriod(Number(event.target.value))}
          className="px-3 py-2 border rounded-lg"
          placeholder="Fast SMA"
        />
        <input
          type="number"
          value={slowPeriod}
          onChange={(event) => setSlowPeriod(Number(event.target.value))}
          className="px-3 py-2 border rounded-lg"
          placeholder="Slow SMA"
        />
        <input
          type="number"
          value={initialCash}
          onChange={(event) => setInitialCash(Number(event.target.value))}
          className="px-3 py-2 border rounded-lg"
          placeholder="Initial Cash"
        />
        <input
          type="number"
          value={days}
          onChange={(event) => setDays(Number(event.target.value))}
          className="px-3 py-2 border rounded-lg"
          placeholder="Days"
        />
        <button
          type="submit"
          disabled={loading}
          className="md:col-span-5 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition disabled:opacity-60"
        >
          {loading ? "Running..." : "Run Backtest"}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Final Equity</p>
              <p className="text-2xl font-bold">
                ${result.finalEquity.toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Total Return</p>
              <p className="text-2xl font-bold">
                {(result.totalReturn * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Max Drawdown</p>
              <p className="text-2xl font-bold">
                {(result.maxDrawdown * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Win Rate</p>
              <p className="text-2xl font-bold">
                {(result.winRate * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow h-96">
            {chartData && (
              <Line
                data={chartData}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Backtest;
