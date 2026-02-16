import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import StockAnalysis from "./pages/StockAnalysis";
import Predictions from "./pages/Predictions";
import Portfolio from "./pages/Portfolio";
import SymbolBrowser from "./pages/SymbolBrowser";
import Backtest from "./pages/Backtest";
import Auth from "./pages/Auth";
import PredictionHistory from "./pages/PredictionHistory";
import AlertSettings from "./pages/AlertSettings";
import DemoAccess from "./pages/DemoAccess";
import "./App.css";

const ProtectedRoute = ({ children, isDemoMode }) => {
  const hasDemoAccess = localStorage.getItem("demoAccess") === "true";

  if (isDemoMode && !hasDemoAccess) {
    return <Navigate to="/demo-access" replace />;
  }

  return children;
};

function App() {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Check if demo mode by looking for demo password preference
    // In production, this could be an env variable
    setIsDemoMode(true); // Enable demo mode by default
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          {localStorage.getItem("demoAccess") === "true" && <Navbar />}
          <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-7xl">
            <Routes>
              <Route path="/demo-access" element={<DemoAccess />} />

              <Route
                path="/"
                element={
                  <ProtectedRoute isDemoMode={isDemoMode}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/symbols"
                element={
                  <ProtectedRoute isDemoMode={isDemoMode}>
                    <SymbolBrowser />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analysis/:symbol"
                element={
                  <ProtectedRoute isDemoMode={isDemoMode}>
                    <StockAnalysis />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/predictions"
                element={
                  <ProtectedRoute isDemoMode={isDemoMode}>
                    <Predictions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/prediction-history"
                element={
                  <ProtectedRoute isDemoMode={isDemoMode}>
                    <PredictionHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/alerts"
                element={
                  <ProtectedRoute isDemoMode={isDemoMode}>
                    <AlertSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/portfolio"
                element={
                  <ProtectedRoute isDemoMode={isDemoMode}>
                    <Portfolio />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/backtest"
                element={
                  <ProtectedRoute isDemoMode={isDemoMode}>
                    <Backtest />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/auth"
                element={
                  <ProtectedRoute isDemoMode={isDemoMode}>
                    <Auth />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
