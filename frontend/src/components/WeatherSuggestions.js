import React from 'react';
import { motion } from 'framer-motion';
import { 
  Umbrella, 
  Sun, 
  ThermometerSnowflake, 
  Wind as WindIcon,
  Droplets,
  CloudSun,
  AlertTriangle
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

const WeatherSuggestions = () => {
  const { currentWeather, forecast, loading, theme, unit } = useWeather();

  if (loading || !currentWeather) {
    return <SuggestionsSkeleton theme={theme} />;
  }

  const suggestions = [];
  const condition = currentWeather.condition?.text?.toLowerCase() || '';
  const temp = unit === 'C' ? currentWeather.temp_c : currentWeather.temp_f;
  const feelsLike = unit === 'C' ? currentWeather.feelslike_c : currentWeather.feelslike_f;
  const humidity = currentWeather.humidity;
  const uv = currentWeather.uv;
  const windKph = currentWeather.wind_kph;
  const chanceOfRain = forecast?.forecastday?.[0]?.day?.daily_chance_of_rain || 0;

  // Rain suggestion
  if (condition.includes('rain') || condition.includes('drizzle') || chanceOfRain > 50) {
    suggestions.push({
      icon: Umbrella,
      text: 'Carry an umbrella today',
      subtext: `${chanceOfRain}% chance of rain`,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10'
    });
  }

  // UV suggestion
  if (uv >= 6) {
    suggestions.push({
      icon: Sun,
      text: 'Wear sunscreen & sunglasses',
      subtext: `UV index is ${uv >= 8 ? 'very high' : 'high'} at ${uv}`,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10'
    });
  }

  // Cold weather
  if ((unit === 'C' && temp <= 10) || (unit === 'F' && temp <= 50)) {
    suggestions.push({
      icon: ThermometerSnowflake,
      text: 'Bundle up! It\'s cold outside',
      subtext: `Feels like ${Math.round(feelsLike)}°${unit}`,
      color: 'text-cyan-400',
      bg: 'bg-cyan-400/10'
    });
  }

  // Hot weather
  if ((unit === 'C' && temp >= 30) || (unit === 'F' && temp >= 86)) {
    suggestions.push({
      icon: Droplets,
      text: 'Stay hydrated! It\'s hot',
      subtext: `Temperature is ${Math.round(temp)}°${unit}`,
      color: 'text-orange-400',
      bg: 'bg-orange-400/10'
    });
  }

  // High wind
  if (windKph >= 30) {
    suggestions.push({
      icon: WindIcon,
      text: 'Strong winds expected',
      subtext: `Wind speed: ${Math.round(windKph)} km/h`,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10'
    });
  }

  // High humidity
  if (humidity >= 80) {
    suggestions.push({
      icon: Droplets,
      text: 'High humidity today',
      subtext: `Humidity at ${humidity}%`,
      color: 'text-teal-400',
      bg: 'bg-teal-400/10'
    });
  }

  // Good weather suggestion
  if (suggestions.length === 0 && (condition.includes('sunny') || condition.includes('clear'))) {
    suggestions.push({
      icon: CloudSun,
      text: 'Perfect weather for outdoor activities!',
      subtext: 'Enjoy the beautiful day',
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10'
    });
  }

  // Weather alerts
  const alerts = forecast?.alerts?.alert;
  if (alerts && alerts.length > 0) {
    suggestions.unshift({
      icon: AlertTriangle,
      text: alerts[0].headline || 'Weather Alert',
      subtext: alerts[0].category || 'Check local advisories',
      color: 'text-red-400',
      bg: 'bg-red-400/10',
      priority: true
    });
  }

  if (suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={`${theme.glassBg} ${theme.glassBorder} rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)]`}
      data-testid="weather-suggestions"
    >
      <h3 className={`text-lg font-display font-semibold mb-4 ${theme.textPrimary}`}>
        Weather Tips
      </h3>

      <div className="space-y-3">
        {suggestions.slice(0, 4).map((suggestion, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
            className={`flex items-center gap-4 p-3 rounded-xl ${suggestion.bg} ${suggestion.priority ? 'ring-1 ring-red-400/50' : ''}`}
          >
            <div className={`p-2 rounded-full bg-white/10`}>
              <suggestion.icon className={`w-5 h-5 ${suggestion.color}`} />
            </div>
            <div className="flex-1">
              <p className={`font-medium ${theme.textPrimary}`}>{suggestion.text}</p>
              <p className={`text-sm ${theme.textSecondary}`}>{suggestion.subtext}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const SuggestionsSkeleton = ({ theme }) => (
  <div className={`${theme.glassBg} ${theme.glassBorder} rounded-3xl p-6 animate-pulse`}>
    <div className="w-32 h-6 bg-white/10 rounded mb-4" />
    <div className="space-y-3">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5">
          <div className="w-10 h-10 bg-white/10 rounded-full" />
          <div className="flex-1">
            <div className="w-40 h-5 bg-white/10 rounded mb-2" />
            <div className="w-32 h-4 bg-white/10 rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default WeatherSuggestions;
