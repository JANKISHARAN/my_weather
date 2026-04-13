import React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Heart, 
  Thermometer, 
  Sun,
  Moon,
  CloudRain,
  Cloud,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Wind
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

// Get weather icon based on condition
const getWeatherIcon = (condition, isDay, size = 'w-24 h-24') => {
  const conditionLower = condition?.toLowerCase() || '';
  const iconClass = `${size}`;
  
  if (conditionLower.includes('thunder') || conditionLower.includes('lightning')) {
    return <CloudLightning className={iconClass} />;
  }
  if (conditionLower.includes('snow') || conditionLower.includes('sleet') || conditionLower.includes('ice')) {
    return <CloudSnow className={iconClass} />;
  }
  if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    return <CloudRain className={iconClass} />;
  }
  if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
    return <CloudFog className={iconClass} />;
  }
  if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) {
    return <Cloud className={iconClass} />;
  }
  if (conditionLower.includes('wind')) {
    return <Wind className={iconClass} />;
  }
  
  // Clear/Sunny
  return isDay ? <Sun className={iconClass} /> : <Moon className={iconClass} />;
};

const WeatherHero = () => {
  const { 
    currentWeather, 
    location, 
    loading, 
    theme, 
    unit, 
    getTemp,
    addFavorite,
    removeFavorite,
    isFavorite,
    favorites
  } = useWeather();

  if (loading || !currentWeather || !location) {
    return <WeatherHeroSkeleton theme={theme} />;
  }

  const temp = getTemp(currentWeather.temp_c, currentWeather.temp_f);
  const feelsLike = getTemp(currentWeather.feelslike_c, currentWeather.feelslike_f);
  const isCurrentFavorite = isFavorite(location.name, location.country);
  const currentFavorite = favorites.find(f => f.name === location.name && f.country === location.country);

  const handleFavoriteToggle = async () => {
    if (isCurrentFavorite && currentFavorite) {
      await removeFavorite(currentFavorite.id);
    } else {
      await addFavorite({
        name: location.name,
        region: location.region,
        country: location.country,
        lat: location.lat,
        lon: location.lon
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${theme.glassBg} ${theme.glassBorder} rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden relative`}
      data-testid="weather-hero"
    >
      {/* Location Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-2">
          <MapPin className={`w-5 h-5 ${theme.textSecondary}`} />
          <div>
            <h2 className={`text-2xl font-display font-semibold ${theme.textPrimary}`}>
              {location.name}
            </h2>
            <p className={`text-sm ${theme.textSecondary}`}>
              {location.region && `${location.region}, `}{location.country}
            </p>
          </div>
        </div>
        <button
          data-testid="favorite-toggle-btn"
          onClick={handleFavoriteToggle}
          className={`p-2 rounded-full transition-all duration-300 ${
            isCurrentFavorite 
              ? 'bg-rose-500/20 text-rose-500' 
              : `hover:bg-white/20 ${theme.textSecondary}`
          }`}
        >
          <Heart className={`w-6 h-6 ${isCurrentFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Main Temperature Display */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-start">
            <span className={`text-8xl sm:text-9xl font-display font-light tracking-tighter ${theme.textPrimary}`}>
              {temp}
            </span>
            <span className={`text-4xl font-light mt-4 ${theme.textSecondary}`}>°{unit}</span>
          </div>
          
          <p className={`text-xl font-medium mt-2 ${theme.textPrimary}`}>
            {currentWeather.condition?.text}
          </p>
          
          <div className={`flex items-center gap-1 mt-2 ${theme.textSecondary}`}>
            <Thermometer className="w-4 h-4" />
            <span className="text-sm">Feels like {feelsLike}°{unit}</span>
          </div>
        </div>

        {/* Weather Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 0.8, delay: 0.2 }}
          className={`${theme.textPrimary} opacity-80`}
        >
          {getWeatherIcon(currentWeather.condition?.text, currentWeather.is_day)}
        </motion.div>
      </div>

      {/* Local Time */}
      <div className={`mt-6 pt-4 border-t ${theme.glassBorder}`}>
        <p className={`text-sm ${theme.textSecondary}`}>
          Local time: {location.localtime?.split(' ')[1] || '--:--'}
        </p>
      </div>
    </motion.div>
  );
};

// Skeleton loader
const WeatherHeroSkeleton = ({ theme }) => (
  <div className={`${theme.glassBg} ${theme.glassBorder} rounded-3xl p-8 animate-pulse`}>
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-white/10 rounded" />
        <div>
          <div className="w-32 h-6 bg-white/10 rounded mb-2" />
          <div className="w-24 h-4 bg-white/10 rounded" />
        </div>
      </div>
    </div>
    <div className="flex items-center justify-between">
      <div>
        <div className="w-48 h-24 bg-white/10 rounded mb-4" />
        <div className="w-32 h-6 bg-white/10 rounded mb-2" />
        <div className="w-24 h-4 bg-white/10 rounded" />
      </div>
      <div className="w-24 h-24 bg-white/10 rounded-full" />
    </div>
  </div>
);

export default WeatherHero;
