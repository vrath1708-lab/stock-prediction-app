import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [isAuthed, setIsAuthed] = useState(
    Boolean(localStorage.getItem("authToken")),
  );

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthed(Boolean(localStorage.getItem("authToken")));
    };

    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("auth-changed", handleAuthChange);
    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("auth-changed", handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.dispatchEvent(new Event("auth-changed"));
    navigate("/");
  };
  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold flex items-center gap-2">
            <span className="text-blue-400">📈</span>StockPredict
          </Link>
          <div className="flex gap-6">
            <Link to="/" className="hover:text-blue-400 transition">
              Dashboard
            </Link>
            <Link to="/symbols" className="hover:text-blue-400 transition">
              Symbols
            </Link>
            <Link to="/predictions" className="hover:text-blue-400 transition">
              Predictions
            </Link>
            <Link
              to="/prediction-history"
              className="hover:text-blue-400 transition"
            >
              Tracker
            </Link>
            {isAuthed && (
              <Link to="/alerts" className="hover:text-blue-400 transition">
                🔔 Alerts
              </Link>
            )}
            <Link to="/portfolio" className="hover:text-blue-400 transition">
              Portfolio
            </Link>
            <Link to="/backtest" className="hover:text-blue-400 transition">
              Backtest
            </Link>
            {isAuthed ? (
              <button
                onClick={handleLogout}
                className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/auth"
                className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
