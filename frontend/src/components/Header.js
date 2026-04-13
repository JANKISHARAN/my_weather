import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

const Header = () => {
  const { unit, toggleUnit, theme } = useWeather();
  const [isDarkMode, setIsDarkMode] = React.useState(true);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between py-4"
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <motion.div
          className={`w-10 h-10 rounded-xl ${theme.glassBg} ${theme.glassBorder} flex items-center justify-center`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-2xl">⛅</span>
        </motion.div>
        <div>
          <h1 className={`text-xl font-display font-bold tracking-tight ${theme.textPrimary}`}>
            SkyCast
          </h1>
          <p className={`text-xs ${theme.textSecondary}`}>Weather Dashboard</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Temperature Unit Toggle */}
        <motion.button
          data-testid="toggle-unit-button"
          onClick={toggleUnit}
          className={`${theme.glassBg} ${theme.glassBorder} px-4 py-2 rounded-full font-medium transition-all duration-300 hover:bg-white/20 ${theme.textPrimary}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className={unit === 'C' ? 'opacity-100' : 'opacity-50'}>°C</span>
          <span className="mx-1 opacity-50">/</span>
          <span className={unit === 'F' ? 'opacity-100' : 'opacity-50'}>°F</span>
        </motion.button>

        {/* Dark Mode Toggle */}
        <motion.button
          data-testid="toggle-theme-button"
          onClick={toggleDarkMode}
          className={`${theme.glassBg} ${theme.glassBorder} p-2.5 rounded-full transition-all duration-300 hover:bg-white/20 ${theme.textPrimary}`}
          whileHover={{ scale: 1.05, rotate: 15 }}
          whileTap={{ scale: 0.95 }}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </motion.button>
      </div>
    </motion.header>
  );
};

export default Header;
