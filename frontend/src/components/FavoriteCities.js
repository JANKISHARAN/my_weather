import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Star, Loader2 } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

const FavoriteCities = () => {
  const { 
    favorites, 
    removeFavorite, 
    fetchWeather, 
    location, 
    theme,
    loading
  } = useWeather();

  if (favorites.length === 0) return null;

  const handleCityClick = async (city) => {
    if (loading) return;
    await fetchWeather(`${city.lat},${city.lon}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className={`${theme.glassBg} ${theme.glassBorder} rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)]`}
      data-testid="favorite-cities"
    >
      <div className="flex items-center gap-2 mb-4">
        <Star className={`w-5 h-5 text-amber-400 fill-amber-400`} />
        <h3 className={`text-lg font-display font-semibold ${theme.textPrimary}`}>
          Favorite Cities
        </h3>
      </div>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {favorites.map((city) => {
            const isActive = location?.name === city.name && location?.country === city.country;
            
            return (
              <motion.div
                key={city.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`group relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive 
                    ? 'bg-white/30 ring-2 ring-white/50' 
                    : 'bg-white/10 hover:bg-white/20'
                }`}
                onClick={() => handleCityClick(city)}
                data-testid={`favorite-city-${city.id}`}
              >
                <MapPin className={`w-4 h-4 ${isActive ? theme.textPrimary : theme.textSecondary}`} />
                <span className={`font-medium ${isActive ? theme.textPrimary : theme.textSecondary}`}>
                  {city.name}
                </span>
                
                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFavorite(city.id);
                  }}
                  className={`opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-white/20 transition-all ${theme.textSecondary}`}
                  data-testid={`remove-favorite-${city.id}`}
                >
                  <X className="w-3 h-3" />
                </button>

                {/* Loading indicator */}
                {loading && isActive && (
                  <Loader2 className="w-4 h-4 animate-spin text-white/50" />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default FavoriteCities;
