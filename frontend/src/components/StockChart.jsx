// frontend/src/components/StockChart.jsx
import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, AreaChart, Area
} from 'recharts';

export default function StockChart({ data, indicatorSeries = {} }) {
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const textColor = isDark ? '#ffffff' : '#1f2937';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  // data: [{date, open, high, low, close, volume}, ...] ascending by date
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="date" minTickGap={20} tick={{ fill: textColor }} stroke={textColor} />
        <YAxis domain={['auto','auto']} tick={{ fill: textColor }} stroke={textColor} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)', 
            border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            color: textColor
          }}
          labelStyle={{ color: textColor }}
          itemStyle={{ color: textColor }}
        />
        <Legend wrapperStyle={{ color: textColor }} />
        <Line type="monotone" dataKey="close" stroke="#8884d8" dot={false} name="Close" />
        {indicatorSeries.sma20 && <Line data={indicatorSeries.sma20} dataKey="value" stroke="#82ca9d" dot={false} name="SMA20" />}
        {indicatorSeries.sma50 && <Line data={indicatorSeries.sma50} dataKey="value" stroke="#ffc658" dot={false} name="SMA50" />}
        {indicatorSeries.ema12 && <Line data={indicatorSeries.ema12} dataKey="value" stroke="#ff7300" dot={false} name="EMA12" />}
      </LineChart>
    </ResponsiveContainer>
  );
}
