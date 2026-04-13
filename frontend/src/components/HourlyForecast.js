import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useWeather } from '../context/WeatherContext';

const HourlyForecast = () => {
  const { forecast, loading, theme, unit, getTemp } = useWeather();

  if (loading || !forecast?.forecastday?.[0]) {
    return <HourlyForecastSkeleton theme={theme} />;
  }

  // Get next 24 hours of data
  const currentHour = new Date().getHours();
  const today = forecast.forecastday[0];
  const tomorrow = forecast.forecastday[1];
  
  let hourlyData = [];
  
  // Get remaining hours from today
  if (today?.hour) {
    hourlyData = today.hour
      .filter((h) => {
        const hourNum = parseInt(h.time.split(' ')[1].split(':')[0]);
        return hourNum >= currentHour;
      })
      .slice(0, 12);
  }
  
  // Fill with tomorrow's hours if needed
  if (tomorrow?.hour && hourlyData.length < 12) {
    const needed = 12 - hourlyData.length;
    hourlyData = [...hourlyData, ...tomorrow.hour.slice(0, needed)];
  }

  const chartData = hourlyData.map((h) => ({
    time: h.time.split(' ')[1].slice(0, 5),
    temp: unit === 'C' ? Math.round(h.temp_c) : Math.round(h.temp_f),
    condition: h.condition?.text,
    icon: h.condition?.icon,
    chance_of_rain: h.chance_of_rain
  }));

  // Determine chart colors based on theme
  const isDark = theme.name === 'night' || theme.name === 'rainy';
  const gradientId = 'tempGradient';
  const lineColor = isDark ? '#60a5fa' : '#f97316';
  const gradientStart = isDark ? 'rgba(96, 165, 250, 0.3)' : 'rgba(249, 115, 22, 0.3)';
  const gradientEnd = isDark ? 'rgba(96, 165, 250, 0)' : 'rgba(249, 115, 22, 0)';

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`${theme.glassBg} ${theme.glassBorder} rounded-xl px-4 py-3 shadow-lg`}>
          <p className={`font-display font-semibold ${theme.textPrimary}`}>
            {data.temp}°{unit}
          </p>
          <p className={`text-sm ${theme.textSecondary}`}>{data.time}</p>
          <p className={`text-xs ${theme.textSecondary}`}>{data.condition}</p>
          {data.chance_of_rain > 0 && (
            <p className="text-xs text-blue-400">{data.chance_of_rain}% rain</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={`${theme.glassBg} ${theme.glassBorder} rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)]`}
      data-testid="hourly-forecast"
    >
      <h3 className={`text-lg font-display font-semibold mb-4 ${theme.textPrimary}`}>
        Hourly Forecast
      </h3>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={gradientStart.replace('0.3', '0.5')} />
                <stop offset="100%" stopColor={gradientEnd} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ 
                fill: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', 
                fontSize: 12 
              }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ 
                fill: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', 
                fontSize: 12 
              }}
              domain={['dataMin - 2', 'dataMax + 2']}
              tickFormatter={(value) => `${value}°`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="temp"
              stroke={lineColor}
              strokeWidth={3}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 6, fill: lineColor, stroke: 'white', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Hourly quick view */}
      <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
        {chartData.slice(0, 8).map((hour, index) => (
          <div
            key={index}
            className={`flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 min-w-[60px]`}
          >
            <span className={`text-xs ${theme.textSecondary}`}>{hour.time}</span>
            {hour.icon && (
              <img 
                src={`https:${hour.icon}`} 
                alt={hour.condition} 
                className="w-8 h-8"
              />
            )}
            <span className={`text-sm font-medium ${theme.textPrimary}`}>
              {hour.temp}°
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const HourlyForecastSkeleton = ({ theme }) => (
  <div className={`${theme.glassBg} ${theme.glassBorder} rounded-3xl p-6 animate-pulse`}>
    <div className="w-32 h-6 bg-white/10 rounded mb-4" />
    <div className="h-48 bg-white/5 rounded-xl" />
    <div className="flex gap-2 mt-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="w-16 h-20 bg-white/5 rounded-xl" />
      ))}
    </div>
  </div>
);

export default HourlyForecast;
