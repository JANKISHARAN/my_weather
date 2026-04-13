import React from "react";
import "@fontsource/outfit/400.css";
import "@fontsource/outfit/600.css";
import "@fontsource/outfit/800.css";
import "@fontsource/manrope/300.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WeatherProvider, useWeather } from "./context/WeatherContext";
import { motion, AnimatePresence } from "framer-motion";

// Components
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import WeatherHero from "./components/WeatherHero";
import HourlyForecast from "./components/HourlyForecast";
import WeeklyForecast from "./components/WeeklyForecast";
import BentoWidgets from "./components/BentoWidgets";
import WeatherSuggestions from "./components/WeatherSuggestions";
import FavoriteCities from "./components/FavoriteCities";
import WeatherAnimations from "./components/WeatherAnimations";

// Main Dashboard Component
const WeatherDashboard = () => {
  const { theme, error, loading } = useWeather();

  return (
    <div className={`min-h-screen relative overflow-hidden transition-all duration-1000 ${theme.gradient}`}>
      {/* Background Texture */}
      <div 
        className={`absolute inset-0 ${theme.textureBlend} bg-cover bg-center pointer-events-none`}
        style={{ backgroundImage: `url(${theme.textureUrl})` }}
      />
      
      {/* Weather Animations */}
      <WeatherAnimations />

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <Header />

          {/* Search Bar */}
          <div className="mt-6 mb-8">
            <SearchBar />
          </div>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 rounded-2xl bg-red-500/20 border border-red-500/30 text-center"
                data-testid="error-message"
              >
                <p className="text-red-200 font-medium">{error}</p>
                <p className="text-red-300/70 text-sm mt-1">Please try searching for another location</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Favorite Cities */}
          <div className="mb-6">
            <FavoriteCities />
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Main Weather */}
            <div className="lg:col-span-8 space-y-6">
              {/* Weather Hero */}
              <WeatherHero />
              
              {/* Hourly Forecast */}
              <HourlyForecast />
              
              {/* Bento Widgets */}
              <BentoWidgets />
            </div>

            {/* Right Column - Weekly & Tips */}
            <div className="lg:col-span-4 space-y-6">
              {/* Weekly Forecast */}
              <WeeklyForecast />
              
              {/* Weather Suggestions */}
              <WeatherSuggestions />
            </div>
          </div>

          {/* Footer */}
          <footer className={`mt-12 pb-8 text-center ${theme.textSecondary}`}>
            <p className="text-sm">
              Powered by <a href="https://www.weatherapi.com/" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">WeatherAPI.com</a>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <WeatherProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WeatherDashboard />} />
          <Route path="*" element={<WeatherDashboard />} />
        </Routes>
      </BrowserRouter>
    </WeatherProvider>
  );
}

export default App;
