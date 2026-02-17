import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
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

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
);

const TechnicalChart = ({ symbol, data }) => {
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState("line");
  const [indicators, setIndicators] = useState({
    sma20: true,
    sma50: false,
    bollinger: false,
    rsi: false,
    macd: false,
  });
  const candleContainerRef = useRef(null);

  const fetchHistoricalData = useCallback(async () => {
    try {
      setLoading(true);
      const history = await stockService.getHistoricalData(symbol, 30);
      setHistoricalData(history);
    } catch (error) {
      console.error("Error fetching historical data:", error);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchHistoricalData();
  }, [fetchHistoricalData]);

  const chartLabels = useMemo(
    () => historicalData.map((d) => d.date),
    [historicalData],
  );

  const lineIndicators = useMemo(() => {
    const closes = historicalData.map((d) => d.close);

    const calcSma = (period) => {
      const result = Array(closes.length).fill(null);
      for (let i = period - 1; i < closes.length; i += 1) {
        const slice = closes.slice(i - period + 1, i + 1);
        result[i] = slice.reduce((sum, value) => sum + value, 0) / period;
      }
      return result;
    };

    const calcEma = (period) => {
      const result = Array(closes.length).fill(null);
      const k = 2 / (period + 1);
      let ema = closes[0];
      result[0] = ema;
      for (let i = 1; i < closes.length; i += 1) {
        ema = closes[i] * k + ema * (1 - k);
        result[i] = ema;
      }
      return result;
    };

    const calcRsi = (period = 14) => {
      const result = Array(closes.length).fill(null);
      const deltas = [];
      for (let i = 1; i < closes.length; i += 1) {
        deltas.push(closes[i] - closes[i - 1]);
      }

      let gains = 0;
      let losses = 0;
      for (let i = 0; i < period; i += 1) {
        if (deltas[i] > 0) gains += deltas[i];
        else losses += Math.abs(deltas[i]);
      }

      let avgGain = gains / period;
      let avgLoss = losses / period;
      result[period] = 100 - 100 / (1 + avgGain / (avgLoss + 1e-10));

      for (let i = period + 1; i < deltas.length; i += 1) {
        avgGain =
          (avgGain * (period - 1) + (deltas[i] > 0 ? deltas[i] : 0)) / period;
        avgLoss =
          (avgLoss * (period - 1) + (deltas[i] < 0 ? Math.abs(deltas[i]) : 0)) /
          period;
        result[i + 1] = 100 - 100 / (1 + avgGain / (avgLoss + 1e-10));
      }

      return result;
    };

    const calcMacd = () => {
      const ema12 = calcEma(12);
      const ema26 = calcEma(26);
      const macdLine = ema12.map((v12, i) => {
        if (v12 === null || ema26[i] === null) return null;
        return v12 - ema26[i];
      });

      const signalLine = Array(macdLine.length).fill(null);
      const k = 2 / 10;
      let ema = null;
      for (let i = 0; i < macdLine.length; i += 1) {
        if (macdLine[i] === null) continue;
        if (ema === null) {
          ema = macdLine[i];
        } else {
          ema = macdLine[i] * k + ema * (1 - k);
        }
        signalLine[i] = ema;
      }

      const histogram = macdLine.map((v, i) => {
        if (v === null || signalLine[i] === null) return null;
        return v - signalLine[i];
      });

      return { macdLine, signalLine, histogram };
    };

    const sma20 = calcSma(20);
    const sma50 = calcSma(50);

    const bollinger = closes.map((_, index) => {
      if (index < 19) return { upper: null, lower: null };
      const slice = closes.slice(index - 19, index + 1);
      const mean = slice.reduce((sum, value) => sum + value, 0) / slice.length;
      const variance =
        slice.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
        slice.length;
      const stdDev = Math.sqrt(variance);
      return {
        upper: mean + 2 * stdDev,
        lower: mean - 2 * stdDev,
      };
    });

    const rsi = calcRsi(14);
    const macd = calcMacd();

    return { sma20, sma50, bollinger, rsi, macd };
  }, [historicalData]);

  const lineData = useMemo(() => {
    const datasets = [
      {
        label: "Close",
        data: historicalData.map((d) => d.close),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.15)",
        tension: 0.3,
        pointRadius: 0,
        fill: true,
      },
    ];

    if (indicators.sma20) {
      datasets.push({
        label: "SMA 20",
        data: lineIndicators.sma20,
        borderColor: "#f59e0b",
        borderDash: [6, 6],
        pointRadius: 0,
      });
    }

    if (indicators.sma50) {
      datasets.push({
        label: "SMA 50",
        data: lineIndicators.sma50,
        borderColor: "#10b981",
        borderDash: [4, 4],
        pointRadius: 0,
      });
    }

    if (indicators.bollinger) {
      datasets.push(
        {
          label: "Bollinger Upper",
          data: lineIndicators.bollinger.map((b) => b.upper),
          borderColor: "#6366f1",
          borderDash: [2, 4],
          pointRadius: 0,
        },
        {
          label: "Bollinger Lower",
          data: lineIndicators.bollinger.map((b) => b.lower),
          borderColor: "#6366f1",
          borderDash: [2, 4],
          pointRadius: 0,
        },
      );
    }

    if (indicators.rsi) {
      datasets.push({
        label: "RSI 14",
        data: lineIndicators.rsi,
        borderColor: "#a855f7",
        borderWidth: 2,
        pointRadius: 0,
        yAxisID: "y1",
      });
    }

    if (indicators.macd) {
      datasets.push(
        {
          label: "MACD",
          data: lineIndicators.macd.macdLine,
          borderColor: "#ec4899",
          borderWidth: 1.5,
          pointRadius: 0,
          yAxisID: "y1",
        },
        {
          label: "Signal",
          data: lineIndicators.macd.signalLine,
          borderColor: "#f97316",
          borderWidth: 1.5,
          borderDash: [4, 4],
          pointRadius: 0,
          yAxisID: "y1",
        },
      );
    }

    return {
      labels: chartLabels,
      datasets,
    };
  }, [chartLabels, historicalData, indicators, lineIndicators]);

  useEffect(() => {
    if (chartType !== "candlestick") return;
    if (!candleContainerRef.current || historicalData.length === 0) return;

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
      historicalData.map((d) => ({
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
  }, [chartType, historicalData]);

  if (loading) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading chart data...</p>
      </div>
    );
  }

  if (historicalData.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No chart data available.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <h3 className="text-base sm:text-lg font-semibold">
          Price Chart (30 Days)
        </h3>
        <div className="flex flex-wrap gap-1 sm:gap-2 items-center text-xs sm:text-sm">
          <button
            onClick={() => setChartType("line")}
            className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm ${chartType === "line" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Line
          </button>
          <button
            onClick={() => setChartType("candlestick")}
            className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm ${chartType === "candlestick" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Candle
          </button>
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={indicators.sma20}
              onChange={(event) =>
                setIndicators((prev) => ({
                  ...prev,
                  sma20: event.target.checked,
                }))
              }
            />
            SMA 20
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={indicators.sma50}
              onChange={(event) =>
                setIndicators((prev) => ({
                  ...prev,
                  sma50: event.target.checked,
                }))
              }
            />
            SMA 50
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={indicators.bollinger}
              onChange={(event) =>
                setIndicators((prev) => ({
                  ...prev,
                  bollinger: event.target.checked,
                }))
              }
            />
            Bollinger
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={indicators.rsi}
              onChange={(event) =>
                setIndicators((prev) => ({
                  ...prev,
                  rsi: event.target.checked,
                }))
              }
            />
            RSI 14
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={indicators.macd}
              onChange={(event) =>
                setIndicators((prev) => ({
                  ...prev,
                  macd: event.target.checked,
                }))
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
                  time: {
                    unit: "day",
                  },
                  ticks: {
                    maxTicksLimit: 6,
                  },
                  grid: {
                    display: false,
                  },
                },
                y: {
                  position: "left",
                  ticks: {
                    callback: (value) => `$${value}`,
                  },
                },
                y1: {
                  type: "linear",
                  display: indicators.rsi || indicators.macd,
                  position: "right",
                  grid: {
                    drawOnChartArea: false,
                  },
                  ticks: {
                    callback: (value) => value.toFixed(1),
                  },
                },
              },
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  mode: "index",
                  intersect: false,
                },
              },
            }}
          />
        ) : (
          <div ref={candleContainerRef} className="w-full h-full" />
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-4">
        <div className="bg-gray-50 p-2 sm:p-3 rounded">
          <p className="text-xs text-gray-600">Open</p>
          <p className="font-semibold text-sm sm:text-base">
            ${historicalData[historicalData.length - 1]?.open.toFixed(2)}
          </p>
        </div>
        <div className="bg-gray-50 p-2 sm:p-3 rounded">
          <p className="text-xs text-gray-600">High</p>
          <p className="font-semibold text-sm sm:text-base">
            ${historicalData[historicalData.length - 1]?.high.toFixed(2)}
          </p>
        </div>
        <div className="bg-gray-50 p-2 sm:p-3 rounded">
          <p className="text-xs text-gray-600">Low</p>
          <p className="font-semibold text-sm sm:text-base">
            ${historicalData[historicalData.length - 1]?.low.toFixed(2)}
          </p>
        </div>
        <div className="bg-gray-50 p-2 sm:p-3 rounded">
          <p className="text-xs text-gray-600">Close</p>
          <p className="font-semibold text-sm sm:text-base">
            ${historicalData[historicalData.length - 1]?.close.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TechnicalChart;
