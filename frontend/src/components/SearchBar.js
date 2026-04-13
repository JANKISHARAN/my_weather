import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, X, Clock, Star, Loader2 } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

const SearchBar = () => {
  const { 
    searchLocations, 
    fetchWeather, 
    addToHistory, 
    searchHistory, 
    clearHistory,
    detectLocation,
    theme,
    loading: weatherLoading
  } = useWeather();
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Search debounce
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowHistory(true);
      return;
    }
    
    setShowHistory(false);
    setIsSearching(true);
    
    const timer = setTimeout(async () => {
      const data = await searchLocations(query);
      setResults(data);
      setIsSearching(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query, searchLocations]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = async (location) => {
    setQuery('');
    setIsOpen(false);
    setResults([]);
    
    await addToHistory(location);
    await fetchWeather(`${location.lat},${location.lon}`);
  };

  const handleUseLocation = async () => {
    setIsOpen(false);
    try {
      const coords = await detectLocation();
      await fetchWeather(coords);
    } catch (err) {
      console.error('Location error:', err);
    }
  };

  const handleHistorySelect = async (item) => {
    setQuery('');
    setIsOpen(false);
    await fetchWeather(`${item.lat},${item.lon}`);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto z-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative ${theme.glassBg} ${theme.glassBorder} rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden`}
      >
        <div className="flex items-center px-6 py-4">
          <Search className={`w-5 h-5 ${theme.textSecondary} mr-3 flex-shrink-0`} />
          <input
            ref={inputRef}
            data-testid="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder="Search for a city..."
            className={`flex-1 bg-transparent outline-none text-lg font-sans ${theme.textPrimary} placeholder:${theme.textSecondary}`}
          />
          {query && (
            <button
              data-testid="clear-search-btn"
              onClick={() => {
                setQuery('');
                setResults([]);
                inputRef.current?.focus();
              }}
              className={`p-1 rounded-full hover:bg-white/20 transition-colors ${theme.textSecondary}`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {(isSearching || weatherLoading) && (
            <Loader2 className={`w-5 h-5 ${theme.textSecondary} animate-spin ml-2`} />
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (results.length > 0 || (showHistory && searchHistory.length > 0) || query.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute top-full left-0 right-0 mt-2 ${theme.glassBg} ${theme.glassBorder} rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] overflow-hidden`}
          >
            {/* Use Current Location */}
            <button
              data-testid="use-location-btn"
              onClick={handleUseLocation}
              className={`w-full flex items-center gap-3 px-6 py-4 hover:bg-white/10 transition-colors ${theme.textPrimary}`}
            >
              <MapPin className="w-5 h-5 text-blue-400" />
              <span className="font-medium">Use current location</span>
            </button>

            <div className={`h-px ${theme.glassBorder}`} />

            {/* Search Results */}
            {results.length > 0 && (
              <div className="max-h-64 overflow-y-auto">
                {results.map((result, index) => (
                  <button
                    key={`${result.id}-${index}`}
                    data-testid={`search-result-${index}`}
                    onClick={() => handleSelect(result)}
                    className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-white/10 transition-colors text-left ${theme.textPrimary}`}
                  >
                    <MapPin className={`w-4 h-4 ${theme.textSecondary} flex-shrink-0`} />
                    <div>
                      <p className="font-medium">{result.name}</p>
                      <p className={`text-sm ${theme.textSecondary}`}>
                        {result.region && `${result.region}, `}{result.country}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Recent Searches */}
            {showHistory && searchHistory.length > 0 && (
              <>
                <div className={`flex items-center justify-between px-6 py-2 ${theme.textSecondary}`}>
                  <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Recent
                  </span>
                  <button
                    data-testid="clear-history-btn"
                    onClick={clearHistory}
                    className="text-xs hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {searchHistory.map((item, index) => (
                    <button
                      key={item.id}
                      data-testid={`history-item-${index}`}
                      onClick={() => handleHistorySelect(item)}
                      className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-white/10 transition-colors text-left ${theme.textPrimary}`}
                    >
                      <Clock className={`w-4 h-4 ${theme.textSecondary} flex-shrink-0`} />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className={`text-sm ${theme.textSecondary}`}>
                          {item.region && `${item.region}, `}{item.country}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
