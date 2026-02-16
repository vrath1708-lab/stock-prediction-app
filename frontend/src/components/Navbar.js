import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [isAuthed, setIsAuthed] = useState(
    Boolean(localStorage.getItem("authToken")),
  );
  const [menuOpen, setMenuOpen] = useState(false);

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
    setMenuOpen(false);
  };

  const navItems = [
    { label: "Dashboard", path: "/" },
    { label: "Symbols", path: "/symbols" },
    { label: "Predictions", path: "/predictions" },
    { label: "Tracker", path: "/prediction-history" },
    { label: "Portfolio", path: "/portfolio" },
    { label: "Backtest", path: "/backtest" },
  ];

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link
            to="/"
            className="text-xl sm:text-2xl font-bold flex items-center gap-2"
          >
            <span className="text-blue-400">📈</span>
            <span className="hidden sm:inline">StockPredict</span>
            <span className="sm:hidden">Stock</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-2 lg:gap-6 items-center">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="hover:text-blue-400 transition text-sm lg:text-base"
              >
                {item.label}
              </Link>
            ))}
            {isAuthed && (
              <Link
                to="/alerts"
                className="hover:text-blue-400 transition text-sm lg:text-base"
              >
                🔔 Alerts
              </Link>
            )}
            {isAuthed ? (
              <button
                onClick={handleLogout}
                className="bg-blue-500 px-3 lg:px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm lg:text-base"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/auth"
                className="bg-blue-500 px-3 lg:px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm lg:text-base"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-1.5"
          >
            <span
              className={`h-0.5 w-6 bg-white transition transform ${
                menuOpen ? "rotate-45 translate-y-2.5" : ""
              }`}
            ></span>
            <span
              className={`h-0.5 w-6 bg-white transition ${
                menuOpen ? "opacity-0" : "opacity-100"
              }`}
            ></span>
            <span
              className={`h-0.5 w-6 bg-white transition transform ${
                menuOpen ? "-rotate-45 -translate-y-2.5" : ""
              }`}
            ></span>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-gray-700 mt-4 pt-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 hover:bg-gray-700 rounded transition"
              >
                {item.label}
              </Link>
            ))}
            {isAuthed && (
              <Link
                to="/alerts"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 hover:bg-gray-700 rounded transition"
              >
                🔔 Alerts
              </Link>
            )}
            {isAuthed ? (
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 bg-red-500 hover:bg-red-600 rounded transition mt-2"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded transition text-center mt-2"
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
