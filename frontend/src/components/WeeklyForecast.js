import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sun, Moon, Cloud, CloudRain, CloudSnow, CloudLightning, CloudFog, Wind,
  ChevronRight
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

const getWeatherIcon = (condition, isDay = true, size = 'w-6 h-6') => {
  const conditionLower = condition?.toLowerCase() || '';
  
  if (conditionLower.includes('thunder')) return <CloudLightning className={size} />;
  if (conditionLower.includes('snow') || conditionLower.includes('sleet')) return <CloudSnow className={size} />;
  if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) return <CloudRain className={size} />;
  if (conditionLower.includes('fog') || conditionLower.includes('mist')) return <CloudFog className={size} />;
  if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) return <Cloud className={size} />;
  if (conditionLower.includes('wind')) return <Wind className={size} />;
  
  return isDay ? <Sun className={size} /> : <Moon className={size} />;
};

const WeeklyForecast = () => {
  const { forecast, loading, theme, unit, getTemp } = useWeather();

  if (loading || !forecast?.forecastday) {
    return <WeeklyForecastSkeleton theme={theme} />;
  }

  const days = forecast.forecastday;
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Find min/max across all days for bar scaling
  const allTemps = days.flatMap(d => [
    unit === 'C' ? d.day.mintemp_c : d.day.mintemp_f,
    unit === 'C' ? d.day.maxtemp_c : d.day.maxtemp_f
  ]);
  const minTemp = Math.min(...allTemps);
  const maxTemp = Math.max(...allTemps);
  const tempRange = maxTemp - minTemp;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`${theme.glassBg} ${theme.glassBorder} rounded-3xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] h-full lg:max-h-[480px]`}
      data-testid="weekly-forecast"
    >
      <h3 className={`text-lg font-display font-semibold mb-3 ${theme.textPrimary}`}>
        7-Day Forecast
      </h3>

      <div className="space-y-1 lg:max-h-[410px] lg:overflow-y-auto lg:pr-1">
        {days.map((day, index) => {
          const date = new Date(day.date);
          const dayName = index === 0 ? 'Today' : dayNames[date.getDay()];
          const lowTemp = getTemp(day.day.mintemp_c, day.day.mintemp_f);
          const highTemp = getTemp(day.day.maxtemp_c, day.day.maxtemp_f);
          
          // Calculate bar position and width
          const lowPos = tempRange ? ((lowTemp - minTemp) / tempRange) * 100 : 0;
          const highPos = tempRange ? ((highTemp - minTemp) / tempRange) * 100 : 100;
          const barWidth = highPos - lowPos;

          return (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group`}
              data-testid={`forecast-day-${index}`}
            >
              {/* Day name */}
              <span className={`w-12 text-sm font-medium ${theme.textPrimary}`}>
                {dayName}
              </span>

              {/* Weather icon */}
              <div className={`w-8 flex justify-center ${theme.textSecondary}`}>
                {day.day.condition?.icon ? (
                  <img 
                    src={`https:${day.day.condition.icon}`} 
                    alt={day.day.condition.text}
                    className="w-8 h-8"
                  />
                ) : (
                  getWeatherIcon(day.day.condition?.text)
                )}
              </div>

              {/* Rain chance */}
              <span className={`w-10 text-xs ${theme.textSecondary}`}>
                {day.day.daily_chance_of_rain > 0 ? `${day.day.daily_chance_of_rain}%` : ''}
              </span>

              {/* Low temp */}
              <span className={`w-8 text-sm text-right ${theme.textSecondary}`}>
                {lowTemp}°
              </span>

              {/* Temperature bar */}
              <div className="flex-1 h-1.5 bg-white/10 rounded-full relative mx-2">
                <div
                  className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 to-orange-400"
                  style={{
                    left: `${lowPos}%`,
                    width: `${Math.max(barWidth, 5)}%`
                  }}
                />
              </div>

              {/* High temp */}
              <span className={`w-8 text-sm font-medium ${theme.textPrimary}`}>
                {highTemp}°
              </span>

              {/* Arrow */}
              <ChevronRight className={`w-4 h-4 ${theme.textSecondary} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

const WeeklyForecastSkeleton = ({ theme }) => (
  <div className={`${theme.glassBg} ${theme.glassBorder} rounded-3xl p-6 animate-pulse h-full`}>
    <div className="w-32 h-6 bg-white/10 rounded mb-4" />
    <div className="space-y-3">
      {[...Array(7)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-2">
          <div className="w-12 h-4 bg-white/10 rounded" />
          <div className="w-8 h-8 bg-white/10 rounded-full" />
          <div className="flex-1 h-2 bg-white/10 rounded" />
          <div className="w-8 h-4 bg-white/10 rounded" />
        </div>
      ))}
    </div>
  </div>
);

export default WeeklyForecast;
