import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { stockService } from "../services/api";
import useLiveRefresh from "../hooks/useLiveRefresh";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSourcesModal, setShowSourcesModal] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: false,
    changeRange: false,
    volumeRange: false,
    signal: false,
    confidenceRange: false,
    minPrice: "",
    maxPrice: "",
    minChange: "",
    maxChange: "",
    minVolume: "",
    maxVolume: "",
    minConfidence: "",
    maxConfidence: "",
    signalValue: "BUY",
  });

  const fetchStocks = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      setSearchError("");
      const data = await stockService.getTopStocks();
      setStocks(data);
    } catch (error) {
      console.error("Error fetching stocks:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const liveRefreshEnabled = searchQuery.trim().length === 0;
  const { lastUpdated, refreshing } = useLiveRefresh(() => fetchStocks(false), {
    intervalMs: 20000,
    enabled: liveRefreshEnabled,
    runOnMount: true,
    streamInclude: ["heartbeat", "stocks"],
  });

  const filteredStocks = stocks.filter((stock) =>
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const applyFilters = (stock) => {
    if (filters.priceRange) {
      const min = parseFloat(filters.minPrice || "-Infinity");
      const max = parseFloat(filters.maxPrice || "Infinity");
      if (Number.isFinite(min) && stock.price < min) return false;
      if (Number.isFinite(max) && stock.price > max) return false;
    }

    if (filters.changeRange) {
      const min = parseFloat(filters.minChange || "-Infinity");
      const max = parseFloat(filters.maxChange || "Infinity");
      if (Number.isFinite(min) && stock.change < min) return false;
      if (Number.isFinite(max) && stock.change > max) return false;
    }

    if (filters.volumeRange) {
      const volumeValue = stock.volume ?? 0;
      const min = parseFloat(filters.minVolume || "-Infinity");
      const max = parseFloat(filters.maxVolume || "Infinity");
      if (Number.isFinite(min) && volumeValue < min) return false;
      if (Number.isFinite(max) && volumeValue > max) return false;
    }

    if (filters.signal && stock.signal !== filters.signalValue) {
      return false;
    }

    if (filters.confidenceRange) {
      const min = parseFloat(filters.minConfidence || "-Infinity");
      const max = parseFloat(filters.maxConfidence || "Infinity");
      if (Number.isFinite(min) && stock.confidence < min) return false;
      if (Number.isFinite(max) && stock.confidence > max) return false;
    }

    return true;
  };

  const visibleStocks = filteredStocks.filter(applyFilters);

  const handleSearch = async (selectedSymbol) => {
    const query = (selectedSymbol || searchQuery).trim().toUpperCase();
    if (!query) {
      return fetchStocks(true);
    }

    try {
      setLoading(true);
      setSearchError("");
      setSuggestions([]);
      const result = await stockService.getStockBySymbol(query);
      setStocks([result]);
    } catch (error) {
      console.error("Error searching stock:", error);
      setStocks([]);
      setSearchError("Symbol not found or unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionSelect = (symbol) => {
    setSearchQuery(symbol);
    setSuggestions([]);
    setSearchError("");
    handleSearch(symbol);
  };

  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSuggestions([]);
      return undefined;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsSuggesting(true);
        const results = await stockService.searchSymbols(query);
        setSuggestions(results);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsSuggesting(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-8 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Stock Prediction Dashboard
            </h1>
            <p className="text-blue-100">
              Near real-time technical analysis and AI-driven predictions
            </p>
            <p className="text-blue-100 text-sm mt-2">
              Last updated:{" "}
              {lastUpdated ? lastUpdated.toLocaleTimeString() : "Syncing..."}
              {refreshing ? " • Updating" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-100">
            <span className="px-2 py-1 rounded-full bg-white/20">
              Live: Alpha Vantage
            </span>
            <span className="px-2 py-1 rounded-full bg-white/20">
              Fallback: Mock Data
            </span>
            <button
              onClick={() => setShowSourcesModal(true)}
              className="ml-2 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 transition"
              aria-label="Data sources info"
            >
              i
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-lg shadow">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.priceRange}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  priceRange: e.target.checked,
                }))
              }
            />
            Price range
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.changeRange}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  changeRange: e.target.checked,
                }))
              }
            />
            Change %
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.volumeRange}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  volumeRange: e.target.checked,
                }))
              }
            />
            Volume
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.signal}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  signal: e.target.checked,
                }))
              }
            />
            Signal
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.confidenceRange}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  confidenceRange: e.target.checked,
                }))
              }
            />
            Confidence %
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 text-sm">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min price"
              value={filters.minPrice}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, minPrice: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-lg"
            />
            <input
              type="number"
              placeholder="Max price"
              value={filters.maxPrice}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min change %"
              value={filters.minChange}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, minChange: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-lg"
            />
            <input
              type="number"
              placeholder="Max change %"
              value={filters.maxChange}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, maxChange: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min volume"
              value={filters.minVolume}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, minVolume: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-lg"
            />
            <input
              type="number"
              placeholder="Max volume"
              value={filters.maxVolume}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, maxVolume: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min confidence %"
              value={filters.minConfidence}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  minConfidence: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border rounded-lg"
            />
            <input
              type="number"
              placeholder="Max confidence %"
              value={filters.maxConfidence}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  maxConfidence: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <select
              value={filters.signalValue}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, signalValue: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="BUY">BUY</option>
              <option value="HOLD">HOLD</option>
              <option value="SELL">SELL</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search stocks (e.g., AAPL, GOOGL, MSFT)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSearch();
            }
          }}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Search
        </button>
      </div>
      {isSuggesting && (
        <div className="text-sm text-gray-500 mb-4">Searching symbols...</div>
      )}
      {suggestions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6 overflow-hidden">
          {suggestions.map((item) => (
            <button
              key={`${item.symbol}-${item.region}`}
              onClick={() => handleSuggestionSelect(item.symbol)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 flex justify-between items-center"
            >
              <div>
                <div className="font-semibold text-gray-900">{item.symbol}</div>
                <div className="text-xs text-gray-500">{item.name}</div>
              </div>
              <div className="text-xs text-gray-400">{item.region}</div>
            </button>
          ))}
        </div>
      )}
      {searchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg">
          {searchError}
        </div>
      )}

      {/* Stocks Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading stocks...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleStocks.map((stock) => (
            <div
              key={stock.symbol}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {stock.symbol}
                  </h3>
                  <p className="text-sm text-gray-500">{stock.name}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    stock.signal === "BUY"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {stock.signal}
                </span>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-bold">${stock.price?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Change:</span>
                  <span
                    className={`font-semibold ${stock.change >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {stock.change >= 0 ? "+" : ""}
                    {stock.change?.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Volume:</span>
                  <span className="font-semibold">
                    {(stock.volume ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Confidence:</span>
                  <span className="font-bold text-blue-600">
                    {stock.confidence?.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>Source</span>
                  <span>{stock.source || "Mock"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Updated</span>
                  <span>
                    {stock.updatedAt
                      ? new Date(stock.updatedAt).toLocaleTimeString()
                      : "-"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/analysis/${stock.symbol}`)}
                className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
              >
                View Analysis
              </button>
            </div>
          ))}
          {visibleStocks.length === 0 && !searchError && (
            <div className="col-span-full text-center text-gray-500 py-8">
              No stocks to display. Try searching for a symbol.
            </div>
          )}
        </div>
      )}

      {showSourcesModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Data Sources</h2>
              <button
                onClick={() => setShowSourcesModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="space-y-3 text-sm text-gray-700">
              <p>
                Live quotes and historical data are fetched from Alpha Vantage
                when the API key is available. Data is cached for 60 seconds to
                stay close to real-time and avoid rate limits.
              </p>
              <p>
                If the API is unavailable or rate-limited, the app falls back to
                mock data so the UI remains responsive.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
