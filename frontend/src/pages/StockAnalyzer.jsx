import { useState, useEffect } from "react";
import axios from "../api/axios";
import { FaChartLine } from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function StockAnalyzer() {
  const [symbol, setSymbol] = useState("AAPL");
  const [quote, setQuote] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  // Listen for theme changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const fetchStock = async () => {
    try {
      setLoading(true);
      setError("");

      const [q, p] = await Promise.all([
        axios.get(`/stocks/quote/${symbol}`),
        axios.get(`/stocks/profile/${symbol}`),
      ]);

      setQuote(q.data);
      setProfile(p.data);
    } catch {
      setError("Failed to fetch stock data");
      setQuote(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const chartData = quote
    ? [
        { name: "Open", price: quote.open },
        { name: "Low", price: quote.low },
        { name: "High", price: quote.high },
        { name: "Current", price: quote.price },
      ]
    : [];

  return (
    <div className="min-h-screen p-6 bg-gray-100 text-gray-900 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 dark:text-white">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <FaChartLine className="text-cyan-400" />
        Stock Market Analyzer
      </h1>

      <div className="flex gap-3 mb-6">
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 dark:bg-white/10 dark:border-white/20 dark:text-white"
        />
        <button
          onClick={fetchStock}
          className="px-6 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 font-semibold"
        >
          Search
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {quote && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="glass p-5 rounded-xl">
              <p className="text-gray-400">Price</p>
              <p className="text-3xl font-bold">${quote.price}</p>
            </div>

            <div className="glass p-5 rounded-xl bg-white text-gray-900 dark:bg-white/10 dark:text-white">
              <p className="text-gray-400">Change</p>
              <p
                className={`text-2xl font-bold ${
                  quote.change >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {quote.change} ({quote.percent}%)
              </p>
            </div>

            <div className="glass p-5 rounded-xl bg-white text-gray-900 dark:bg-white/10 dark:text-white">
              <p className="text-gray-400">Prev Close</p>
              <p className="text-2xl font-bold">${quote.previousClose}</p>
            </div>
          </div>

          <div className="glass p-6 rounded-xl mb-6 bg-white dark:bg-white/10">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: isDark ? '#ffffff' : '#1f2937' }} 
                  stroke={isDark ? '#ffffff' : '#1f2937'} 
                />
                <YAxis 
                  tick={{ fill: isDark ? '#ffffff' : '#1f2937' }} 
                  stroke={isDark ? '#ffffff' : '#1f2937'} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)', 
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px',
                    color: isDark ? '#ffffff' : '#1f2937'
                  }}
                  labelStyle={{ color: isDark ? '#ffffff' : '#1f2937' }}
                  itemStyle={{ color: isDark ? '#ffffff' : '#1f2937' }}
                />
                <Line dataKey="price" stroke="#22d3ee" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {profile && profile.name && (
        <div className="glass p-6 rounded-xl bg-white text-gray-900 dark:bg-white/10 dark:text-white">
          <h2 className="text-xl font-semibold mb-2">{profile.name}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {profile.finnhubIndustry}
          </p>
          <p className="text-gray-700 dark:text-gray-300">{profile.weburl}</p>
        </div>
      )}
    </div>
  );
}
