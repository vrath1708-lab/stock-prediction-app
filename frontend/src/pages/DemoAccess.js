import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const DemoAccess = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const DEMO_PASSWORD = "trader123"; // Change this!

  const handleAccess = () => {
    if (password === DEMO_PASSWORD) {
      localStorage.setItem("demoAccess", "true");
      navigate("/");
    } else {
      setError("❌ Incorrect password");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              📈 StockPredict
            </h1>
            <p className="text-gray-600">AI-Powered Trading Analysis</p>
          </div>

          {/* Demo Info */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
            <p className="text-sm text-gray-700">
              <strong>Welcome Trader! 🎯</strong>
              <br />
              This is a live demo. Enter the access code to explore the
              platform.
            </p>
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Access Code
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              onKeyPress={(e) => e.key === "Enter" && handleAccess()}
              placeholder="Enter access code"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Access Button */}
          <button
            onClick={handleAccess}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transition transform hover:scale-105 mb-4"
          >
            🔓 Access Demo
          </button>

          {/* Features List */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              What You'll Test:
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✅ Real-time stock data and charts</li>
              <li>✅ AI prediction signals (BUY/SELL/HOLD)</li>
              <li>✅ Technical indicators (SMA, RSI, MACD, Bollinger)</li>
              <li>✅ News & sentiment analysis</li>
              <li>✅ Backtesting tools</li>
              <li>✅ Portfolio simulator</li>
              <li>✅ Prediction accuracy tracker</li>
            </ul>
          </div>

          {/* Footer */}
          <p className="text-xs text-gray-500 text-center mt-6">
            Feedback? This is a work in progress! Your opinions matter. 🙌
          </p>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-white/20 backdrop-blur-sm rounded-lg p-4 text-white text-sm">
          <p className="font-semibold mb-2">💡 Quick Tips:</p>
          <ul className="space-y-1 text-white/90">
            <li>
              • Check <strong>Dashboard</strong> for live predictions
            </li>
            <li>
              • Try <strong>Stock Analysis</strong> for detailed charts
            </li>
            <li>
              • Use <strong>Symbols</strong> to search any ticker
            </li>
            <li>
              • Test <strong>Backtest</strong> with past data
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DemoAccess;
