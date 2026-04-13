import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Default for local dev when .env is missing or CRA cache is stale
const BACKEND_URL = (process.env.local.REACT_APP_BACKEND_URL || "").replace(/\/$/, "");
const API = `${BACKEND_URL}/api`;

const getFetchErrorMessage = (err) => {
  const detail = err.response?.data?.detail;
  if (detail) return typeof detail === 'string' ? detail : JSON.stringify(detail);
  if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
    return 'Cannot reach the weather server. Start the backend (port 8000) and refresh.';
  }
  if (err.message) return err.message;
  return 'Failed to fetch weather data';
};

const WeatherContext = createContext(null);

// Weather condition to theme mapping
const getWeatherTheme = (condition, isDay) => {
  if (!isDay) {
    return {
      name: 'night',
      gradient: 'bg-gradient-to-br from-indigo-950 via-purple-950 to-black',
      textPrimary: 'text-white',
      textSecondary: 'text-purple-200/70',
      glassBg: 'bg-white/5 backdrop-blur-3xl',
      glassBorder: 'border border-white/10',
      textureUrl: 'https://static.prod-images.emergentagent.com/jobs/9aed61f5-41ca-4af7-a97f-18802955e802/images/c948bc9937615fed8c3b0d0add3dde5949709a31aa83421e60cd52b40374f71a.png',
      textureBlend: 'mix-blend-screen opacity-30'
    };
  }
  
  const conditionLower = condition?.toLowerCase() || '';
  
  if (conditionLower.includes('rain') || conditionLower.includes('drizzle') || conditionLower.includes('thunder')) {
    return {
      name: 'rainy',
      gradient: 'bg-gradient-to-br from-slate-800 via-blue-900 to-slate-950',
      textPrimary: 'text-white',
      textSecondary: 'text-blue-100/80',
      glassBg: 'bg-white/10 backdrop-blur-3xl',
      glassBorder: 'border border-white/10',
      textureUrl: 'https://static.prod-images.emergentagent.com/jobs/9aed61f5-41ca-4af7-a97f-18802955e802/images/f886c55c207bcaa1f74ce76729ce936a46c8baa93247cfbf6657ca19a14e662c.png',
      textureBlend: 'mix-blend-overlay opacity-60'
    };
  }
  
  if (conditionLower.includes('cloud') || conditionLower.includes('overcast') || conditionLower.includes('mist') || conditionLower.includes('fog')) {
    return {
      name: 'cloudy',
      gradient: 'bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500',
      textPrimary: 'text-slate-900',
      textSecondary: 'text-slate-700',
      glassBg: 'bg-white/20 backdrop-blur-2xl',
      glassBorder: 'border border-white/30',
      textureUrl: 'https://static.prod-images.emergentagent.com/jobs/9aed61f5-41ca-4af7-a97f-18802955e802/images/2d981e4915b085347a05ffbea74d729281124d5738c64e3fb67e8d3e4dfc58df.png',
      textureBlend: 'mix-blend-overlay opacity-40'
    };
  }
  
  // Default sunny
  return {
    name: 'sunny',
    gradient: 'bg-gradient-to-br from-amber-200 via-orange-300 to-rose-400',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-700',
    glassBg: 'bg-white/30 backdrop-blur-2xl',
    glassBorder: 'border border-white/40',
    textureUrl: 'https://static.prod-images.emergentagent.com/jobs/9aed61f5-41ca-4af7-a97f-18802955e802/images/39c9bb670eb96f38f57dd6b62675032b24d01ee68d48ecff2981c04b9fd15c05.png',
    textureBlend: 'mix-blend-overlay opacity-40'
  };
};

export const WeatherProvider = ({ children }) => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState('C'); // 'C' or 'F'
  const [favorites, setFavorites] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [theme, setTheme] = useState(getWeatherTheme('sunny', true));

  // Fetch weather data for a location
  const fetchWeather = useCallback(async (locationQuery) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API}/weather/forecast/${encodeURIComponent(locationQuery)}`, {
        params: { days: 7, aqi: true, alerts: true }
      });
      
      const data = response.data;
      setCurrentWeather(data.current);
      setForecast(data.forecast);
      setLocation(data.location);
      
      // Update theme based on weather
      const newTheme = getWeatherTheme(data.current?.condition?.text, data.current?.is_day);
      setTheme(newTheme);
      
      return data;
    } catch (err) {
      setError(getFetchErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Search locations
  const searchLocations = useCallback(async (query) => {
    if (!query || query.length < 2) return [];
    
    try {
      const response = await axios.get(`${API}/weather/search`, {
        params: { q: query }
      });
      return response.data || [];
    } catch (err) {
      console.error('Search error:', err);
      return [];
    }
  }, []);

  // Add to search history
  const addToHistory = useCallback(async (locationData) => {
    try {
      await axios.post(`${API}/history`, {
        query: locationData.name,
        name: locationData.name,
        region: locationData.region || '',
        country: locationData.country,
        lat: locationData.lat,
        lon: locationData.lon
      });
      fetchSearchHistory();
    } catch (err) {
      console.error('Failed to add to history:', err);
    }
  }, []);

  // Fetch search history
  const fetchSearchHistory = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/history`);
      setSearchHistory(response.data || []);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  }, []);

  // Clear search history
  const clearHistory = useCallback(async () => {
    try {
      await axios.delete(`${API}/history`);
      setSearchHistory([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  }, []);

  // Fetch favorites
  const fetchFavorites = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/favorites`);
      setFavorites(response.data || []);
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
    }
  }, []);

  // Add favorite
  const addFavorite = useCallback(async (city) => {
    try {
      await axios.post(`${API}/favorites`, {
        name: city.name,
        region: city.region || '',
        country: city.country,
        lat: city.lat,
        lon: city.lon
      });
      fetchFavorites();
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to add favorite';
      throw new Error(message);
    }
  }, [fetchFavorites]);

  // Remove favorite
  const removeFavorite = useCallback(async (favoriteId) => {
    try {
      await axios.delete(`${API}/favorites/${favoriteId}`);
      fetchFavorites();
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
  }, [fetchFavorites]);

  // Check if location is favorite
  const isFavorite = useCallback((name, country) => {
    return favorites.some(f => f.name === name && f.country === country);
  }, [favorites]);

  // Toggle unit
  const toggleUnit = useCallback(() => {
    setUnit(prev => prev === 'C' ? 'F' : 'C');
  }, []);

  // Get temperature based on unit
  const getTemp = useCallback((tempC, tempF) => {
    return unit === 'C' ? Math.round(tempC) : Math.round(tempF);
  }, [unit]);

  // Get geolocation
  const detectLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve(`${latitude},${longitude}`);
        },
        (err) => {
          reject(new Error('Location access denied'));
        },
        { timeout: 10000 }
      );
    });
  }, []);

  // Initial load
  useEffect(() => {
    fetchFavorites();
    fetchSearchHistory();
    
    // Try to get user's location
    detectLocation()
      .then(coords => fetchWeather(coords))
      .catch(() => {
        // Default to London if geolocation fails
        fetchWeather('London').catch(() => {});
      });
  }, [detectLocation, fetchWeather, fetchFavorites, fetchSearchHistory]);

  const value = {
    currentWeather,
    forecast,
    location,
    loading,
    error,
    unit,
    favorites,
    searchHistory,
    theme,
    fetchWeather,
    searchLocations,
    addToHistory,
    fetchSearchHistory,
    clearHistory,
    fetchFavorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleUnit,
    getTemp,
    detectLocation
  };

  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};
