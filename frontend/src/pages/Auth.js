import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { stockService } from "../services/api";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError("");
      const payload = { email, password };
      const data =
        mode === "login"
          ? await stockService.login(payload)
          : await stockService.register(payload);

      localStorage.setItem("authToken", data.token);
      window.dispatchEvent(new Event("auth-changed"));
      navigate("/portfolio");
    } catch (err) {
      setError("Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-8 rounded-lg">
        <h1 className="text-4xl font-bold mb-2">Account Access</h1>
        <p className="text-slate-200">
          Sign in to manage your portfolio simulator and saved settings.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-lg ${
              mode === "login"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-2 rounded-lg ${
              mode === "register"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-60"
          >
            {loading
              ? "Working..."
              : mode === "login"
                ? "Login"
                : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
