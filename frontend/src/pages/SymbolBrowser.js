import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { stockService } from "../services/api";
import useLiveRefresh from "../hooks/useLiveRefresh";

const PAGE_SIZE = 10;

const SymbolBrowser = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    region: "",
    type: "",
    currency: "",
  });
  const [source, setSource] = useState("Alpha Vantage");

  const searchSymbols = useCallback(
    async (value) => {
      const trimmed = value.trim();
      if (trimmed.length < 2) {
        setResults([]);
        setError("");
        return;
      }

      try {
        setLoading(true);
        setError("");
        const data = await stockService.searchSymbols(trimmed, {
          page,
          pageSize: PAGE_SIZE,
          region: filters.region,
          type: filters.type,
          currency: filters.currency,
        });
        setResults(data.items);
        setTotal(data.total);
        setSource(data.source || "Alpha Vantage");
        if (!data.items.length) {
          setError("No symbols found.");
        }
      } catch (err) {
        setResults([]);
        setTotal(0);
        setError("Unable to fetch symbols right now.");
      } finally {
        setLoading(false);
      }
    },
    [filters.currency, filters.region, filters.type, page],
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchSymbols(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, searchSymbols]);

  useEffect(() => {
    setPage(1);
  }, [query, filters.region, filters.type, filters.currency]);

  const { lastUpdated, refreshing } = useLiveRefresh(
    () => searchSymbols(query),
    {
      intervalMs: 30000,
      enabled: query.trim().length >= 2,
      runOnMount: false,
    },
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handlePrevious = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 text-white p-8 rounded-lg">
        <h1 className="text-4xl font-bold mb-2">Symbol Browser</h1>
        <p className="text-slate-200">
          Search for any symbol and open its analysis in one click.
        </p>
      </div>

      <div className="bg-white p-5 rounded-lg shadow">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Search symbols (type at least 2 characters)
        </label>
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try AAPL, MSFT, NVDA, TSLA..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
        />
        <p className="text-xs text-gray-500 mt-2">
          Results are powered by {source} (cached for 60 seconds).
        </p>
        {query.trim().length >= 2 && (
          <p className="text-xs text-gray-500 mt-1">
            Last updated:{" "}
            {lastUpdated ? lastUpdated.toLocaleTimeString() : "Waiting..."}
            {refreshing ? " • Updating" : ""}
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <input
            type="text"
            value={filters.region}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, region: event.target.value }))
            }
            placeholder="Filter by region (e.g., United States)"
            className="w-full px-3 py-2 border rounded-lg"
          />
          <input
            type="text"
            value={filters.type}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, type: event.target.value }))
            }
            placeholder="Filter by type (e.g., Equity)"
            className="w-full px-3 py-2 border rounded-lg"
          />
          <input
            type="text"
            value={filters.currency}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, currency: event.target.value }))
            }
            placeholder="Filter by currency (e.g., USD)"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
      </div>

      {loading && (
        <div className="text-sm text-gray-500">Searching symbols...</div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow divide-y">
          {results.map((item) => (
            <div
              key={`${item.symbol}-${item.region}`}
              className="p-4 flex justify-between items-center"
            >
              <div>
                <div className="font-semibold text-gray-900">{item.symbol}</div>
                <div className="text-sm text-gray-500">{item.name}</div>
                <div className="text-xs text-gray-400">
                  {item.type} | {item.region} | {item.currency}
                </div>
              </div>
              <button
                onClick={() => navigate(`/analysis/${item.symbol}`)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                View Analysis
              </button>
            </div>
          ))}
        </div>
      )}

      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border disabled:opacity-50"
          >
            Previous
          </button>
          <div className="text-sm text-gray-500">
            Page {page} of {totalPages} (total {total} symbols)
          </div>
          <button
            onClick={handleNext}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg border disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default SymbolBrowser;
