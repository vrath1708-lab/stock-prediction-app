import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { Line } from "react-chartjs-2";
import { createChart } from "lightweight-charts";
import { stockService } from "../services/api";
import useLiveRefresh from "../hooks/useLiveRefresh";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
);

const TechnicalChart = ({ symbol }) => {
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState("line");
  const [lookbackDays, setLookbackDays] = useState(30);
  const [indicators, setIndicators] = useState({
    sma20: true,
    sma50: false,
    bollinger: false,
    rsi: false,
    macd: false,
  });
  const candleContainerRef = useRef(null);

  const requiredHistoryDays = useMemo(
    () => Math.max(lookbackDays, indicators.sma50 ? 60 : 30),
    [indicators.sma50, lookbackDays],
  );

  const fetchHistoricalData = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) setLoading(true);
        const history = await stockService.getHistoricalData(symbol, requiredHistoryDays);
        setHistoricalData(Array.isArray(history) ? history : []);
      } catch (error) {
        console.error("Error fetching historical data:", error);
      } finally {
        setLoading(false);
      }
    },
    [requiredHistoryDays, symbol],
  );

  useLiveRefresh(() => fetchHistoricalData(false), {
    intervalMs: 20000,
    enabled: Boolean(symbol),
    runOnMount: true,
    streamInclude: ["heartbeat", "analysis"],
    streamSymbol: symbol,
  });

  const visibleHistoricalData = useMemo(
    () => historicalData.slice(-lookbackDays),
    [historicalData, lookbackDays],
  );

  const lineIndicators = useMemo(() => {
    const closes = historicalData.map((d) => d.close);

    const calcSma = (period) => {
      const result = Array(closes.length).fill(null);
      for (let index = period - 1; index < closes.length; index += 1) {
        const slice = closes.slice(index - period + 1, index + 1);
        result[index] = slice.reduce((sum, value) => sum + value, 0) / period;
      }
      return result;
    };

    const calcEma = (period) => {
      const result = Array(closes.length).fill(null);
      if (!closes.length) return result;
      const multiplier = 2 / (period + 1);
      let ema = closes[0];
      result[0] = ema;
      for (let index = 1; index < closes.length; index += 1) {
        ema = closes[index] * multiplier + ema * (1 - multiplier);
        result[index] = ema;
      }
      return result;
    };

    const calcRsi = (period = 14) => {
      const result = Array(closes.length).fill(null);
      if (closes.length <= period) return result;

      const deltas = [];
      for (let index = 1; index < closes.length; index += 1) {
        deltas.push(closes[index] - closes[index - 1]);
      }

      let gains = 0;
      let losses = 0;
      for (let index = 0; index < period; index += 1) {
        if (deltas[index] > 0) gains += deltas[index];
        else losses += Math.abs(deltas[index]);
      }

      let avgGain = gains / period;
      let avgLoss = losses / period;
      result[period] = 100 - 100 / (1 + avgGain / (avgLoss + 1e-10));

      for (let index = period + 1; index < deltas.length; index += 1) {
        avgGain =
          (avgGain * (period - 1) + (deltas[index] > 0 ? deltas[index] : 0)) /
          period;
        avgLoss =
          (avgLoss * (period - 1) + (deltas[index] < 0 ? Math.abs(deltas[index]) : 0)) /
          period;
        result[index + 1] = 100 - 100 / (1 + avgGain / (avgLoss + 1e-10));
      }

      return result;
    };

    const calcMacd = () => {
      const ema12 = calcEma(12);
      const ema26 = calcEma(26);
      const macdLine = ema12.map((emaValue, index) => {
        if (emaValue === null || ema26[index] === null) return null;
        return emaValue - ema26[index];
      });

      const signalLine = Array(macdLine.length).fill(null);
      const multiplier = 2 / 10;
      let ema = null;
      for (let index = 0; index < macdLine.length; index += 1) {
        if (macdLine[index] === null) continue;
        ema =
          ema === null
            ? macdLine[index]
            : macdLine[index] * multiplier + ema * (1 - multiplier);
        signalLine[index] = ema;
      }

      const histogram = macdLine.map((macdValue, index) => {
        if (macdValue === null || signalLine[index] === null) return null;
        return macdValue - signalLine[index];
      });

      return { macdLine, signalLine, histogram };
    };

    const bollinger = closes.map((_, index) => {
      if (index < 19) return { upper: null, lower: null };
      const slice = closes.slice(index - 19, index + 1);
      const mean = slice.reduce((sum, value) => sum + value, 0) / slice.length;
      const variance =
        slice.reduce((sum, value) => sum + (value - mean) ** 2, 0) / slice.length;
      const stdDev = Math.sqrt(variance);
      return { upper: mean + 2 * stdDev, lower: mean - 2 * stdDev };
    });

    return {
      sma20: calcSma(20),
      sma50: calcSma(50),
      bollinger,
      rsi: calcRsi(14),
      macd: calcMacd(),
    };
  }, [historicalData]);

  const sliceVisible = useCallback(
    (series) => series.slice(-lookbackDays),
    [lookbackDays],
  );

  const lineData = useMemo(
    () => ({
      labels: visibleHistoricalData.map((d) => d.date),
      datasets: [
        {
          label: "Close",
          data: visibleHistoricalData.map((d) => d.close),
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.15)",
          tension: 0.3,
          pointRadius: 0,
          fill: true,
        },
        ...(indicators.sma20
          ? [
              {
                label: "SMA 20",
                data: sliceVisible(lineIndicators.sma20),
                borderColor: "#f59e0b",
                borderDash: [6, 6],
                pointRadius: 0,
              },
            ]
          : []),
        ...(indicators.sma50
          ? [
              {
                label: "SMA 50",
                data: sliceVisible(lineIndicators.sma50),
                borderColor: "#10b981",
                borderDash: [4, 4],
                pointRadius: 0,
              },
            ]
          : []),
        ...(indicators.bollinger
          ? [
              {
                label: "Bollinger Upper",
                data: sliceVisible(lineIndicators.bollinger.map((b) => b.upper)),
                borderColor: "#6366f1",
                borderDash: [2, 4],
                pointRadius: 0,
              },
              {
                label: "Bollinger Lower",
                data: sliceVisible(lineIndicators.bollinger.map((b) => b.lower)),
                borderColor: "#6366f1",
                borderDash: [2, 4],
                pointRadius: 0,
              },
            ]
          : []),
        ...(indicators.rsi
          ? [
              {
                label: "RSI 14",
                data: sliceVisible(lineIndicators.rsi),
                borderColor: "#a855f7",
                borderWidth: 2,
                pointRadius: 0,
                yAxisID: "y1",
              },
            ]
          : []),
        ...(indicators.macd
          ? [
              {
                label: "MACD",
                data: sliceVisible(lineIndicators.macd.macdLine),
                borderColor: "#ec4899",
                borderWidth: 1.5,
                pointRadius: 0,
                yAxisID: "y1",
              },
              {
                label: "Signal",
                data: sliceVisible(lineIndicators.macd.signalLine),
                borderColor: "#f97316",
                borderWidth: 1.5,
                borderDash: [4, 4],
                pointRadius: 0,
                yAxisID: "y1",
              },
            ]
          : []),
      ],
    }),
    [
      indicators.bollinger,
      indicators.macd,
      indicators.rsi,
      indicators.sma20,
      indicators.sma50,
      lineIndicators.bollinger,
      lineIndicators.macd.macdLine,
      lineIndicators.macd.signalLine,
      lineIndicators.rsi,
      lineIndicators.sma20,
      lineIndicators.sma50,
      sliceVisible,
      visibleHistoricalData,
    ],
  );

  useEffect(() => {
    if (chartType !== "candlestick") return undefined;
    if (!candleContainerRef.current || visibleHistoricalData.length === 0) {
      return undefined;
    }

    const container = candleContainerRef.current;
    const chart = createChart(container, {
      layout: { background: { color: "#ffffff" }, textColor: "#1f2937" },
      grid: {
        vertLines: { color: "#f3f4f6" },
        horzLines: { color: "#f3f4f6" },
      },
      timeScale: { borderColor: "#e5e7eb" },
      rightPriceScale: { borderColor: "#e5e7eb" },
      width: container.clientWidth,
      height: container.clientHeight,
    });

    const series = chart.addCandlestickSeries({
      upColor: "#10b981",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    });

    series.setData(
      visibleHistoricalData.map((d) => ({
        time: d.date,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      })),
    );

    chart.timeScale().fitContent();

    const handleResize = () => {
      chart.applyOptions({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [chartType, visibleHistoricalData]);

  if (loading) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading chart data...</p>
      </div>
    );
  }

  if (visibleHistoricalData.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No chart data available.</p>
      </div>
    );
  }

  const latest = visibleHistoricalData[visibleHistoricalData.length - 1];

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <h3 className="text-base sm:text-lg font-semibold">Price Chart ({lookbackDays} Days)</h3>
        <div className="flex flex-wrap gap-1 sm:gap-2 items-center text-xs sm:text-sm">
          <button
            onClick={() => setLookbackDays(30)}
            className={`px-2 sm:px-3 py-1 rounded ${lookbackDays === 30 ? "bg-slate-700 text-white" : "bg-gray-200"}`}
          >
            30D
          </button>
          <button
            onClick={() => setLookbackDays(60)}
            className={`px-2 sm:px-3 py-1 rounded ${lookbackDays === 60 ? "bg-slate-700 text-white" : "bg-gray-200"}`}
          >
            60D
          </button>
          <button
            onClick={() => setLookbackDays(90)}
            className={`px-2 sm:px-3 py-1 rounded ${lookbackDays === 90 ? "bg-slate-700 text-white" : "bg-gray-200"}`}
          >
            90D
          </button>
          <button
            onClick={() => setChartType("line")}
            className={`px-2 sm:px-3 py-1 rounded ${chartType === "line" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Line
          </button>
          <button
            onClick={() => setChartType("candlestick")}
            className={`px-2 sm:px-3 py-1 rounded ${chartType === "candlestick" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Candle
          </button>
          <label className="flex items-center gap-2 text-gray-600">
            <input
              type="checkbox"
              checked={indicators.sma20}
              onChange={(event) =>
                setIndicators((prev) => ({ ...prev, sma20: event.target.checked }))
              }
            />
            SMA 20
          </label>
          <label className="flex items-center gap-2 text-gray-600">
            <input
              type="checkbox"
              checked={indicators.sma50}
              onChange={(event) =>
                setIndicators((prev) => ({ ...prev, sma50: event.target.checked }))
              }
            />
            SMA 50
          </label>
          <label className="flex items-center gap-2 text-gray-600">
            <input
              type="checkbox"
              checked={indicators.bollinger}
              onChange={(event) =>
                setIndicators((prev) => ({ ...prev, bollinger: event.target.checked }))
              }
            />
            Bollinger
          </label>
          <label className="flex items-center gap-2 text-gray-600">
            <input
              type="checkbox"
              checked={indicators.rsi}
              onChange={(event) =>
                setIndicators((prev) => ({ ...prev, rsi: event.target.checked }))
              }
            />
            RSI 14
          </label>
          <label className="flex items-center gap-2 text-gray-600">
            <input
              type="checkbox"
              checked={indicators.macd}
              onChange={(event) =>
                setIndicators((prev) => ({ ...prev, macd: event.target.checked }))
              }
            />
            MACD
          </label>
        </div>
      </div>

      <div className="relative w-full h-64 sm:h-80 bg-white border border-gray-200 rounded-lg p-2 sm:p-4">
        {chartType === "line" ? (
          <Line
            data={lineData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  type: "time",
                  time: { unit: "day" },
                  ticks: { maxTicksLimit: 6 },
                  grid: { display: false },
                },
                y: {
                  position: "left",
                  ticks: { callback: (value) => `$${value}` },
                },
                y1: {
                  type: "linear",
                  display: indicators.rsi || indicators.macd,
                  position: "right",
                  grid: { drawOnChartArea: false },
                  ticks: { callback: (value) => Number(value).toFixed(1) },
                },
              },
              plugins: {
                legend: { display: false },
                tooltip: { mode: "index", intersect: false },
              },
            }}
          />
        ) : (
          <div ref={candleContainerRef} className="w-full h-full" />
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-4">
        <div className="bg-gray-50 p-2 sm:p-3 rounded">
          <p className="text-xs text-gray-600">Open</p>
          <p className="font-semibold text-sm sm:text-base">${latest?.open.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 p-2 sm:p-3 rounded">
          <p className="text-xs text-gray-600">High</p>
          <p className="font-semibold text-sm sm:text-base">${latest?.high.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 p-2 sm:p-3 rounded">
          <p className="text-xs text-gray-600">Low</p>
          <p className="font-semibold text-sm sm:text-base">${latest?.low.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 p-2 sm:p-3 rounded">
          <p className="text-xs text-gray-600">Close</p>
          <p className="font-semibold text-sm sm:text-base">${latest?.close.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default TechnicalChart;
