import React from 'react';
import { motion } from 'framer-motion';
import { 
  Droplets, 
  Wind, 
  Gauge, 
  Sun, 
  Eye, 
  Thermometer,
  Sunrise,
  Sunset
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

const MetricWidget = ({ icon: Icon, label, value, unit, subValue, color, delay, theme }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3, delay }}
    className={`${theme.glassBg} ${theme.glassBorder} rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:bg-white/20 transition-all duration-300`}
  >
    <div className="flex items-center gap-2 mb-3">
      <Icon className={`w-4 h-4 ${color || theme.textSecondary}`} />
      <span className={`text-xs font-bold uppercase tracking-wider ${theme.textSecondary}`}>
        {label}
      </span>
    </div>
    <div className={`text-2xl font-display font-semibold ${theme.textPrimary}`}>
      {value}
      {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
    </div>
    {subValue && (
      <p className={`text-xs mt-1 ${theme.textSecondary}`}>{subValue}</p>
    )}
  </motion.div>
);

const BentoWidgets = () => {
  const { currentWeather, forecast, loading, theme, unit } = useWeather();

  if (loading || !currentWeather) {
    return <BentoWidgetsSkeleton theme={theme} />;
  }

  // Get astronomy data
  const astronomy = forecast?.forecastday?.[0]?.astro;

  // AQI data
  const aqi = currentWeather.air_quality;
  const aqiValue = aqi?.['us-epa-index'];
  const aqiLabels = ['', 'Good', 'Moderate', 'Unhealthy (Sensitive)', 'Unhealthy', 'Very Unhealthy', 'Hazardous'];
  const aqiColors = ['', 'text-green-400', 'text-yellow-400', 'text-orange-400', 'text-red-400', 'text-purple-400', 'text-rose-600'];

  // UV Index
  const uvIndex = currentWeather.uv;
  const getUvLabel = (uv) => {
    if (uv <= 2) return 'Low';
    if (uv <= 5) return 'Moderate';
    if (uv <= 7) return 'High';
    if (uv <= 10) return 'Very High';
    return 'Extreme';
  };
  const getUvColor = (uv) => {
    if (uv <= 2) return 'text-green-400';
    if (uv <= 5) return 'text-yellow-400';
    if (uv <= 7) return 'text-orange-400';
    if (uv <= 10) return 'text-red-400';
    return 'text-purple-400';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="bento-widgets">
      {/* Humidity */}
      <MetricWidget
        icon={Droplets}
        label="Humidity"
        value={currentWeather.humidity}
        unit="%"
        subValue={currentWeather.humidity > 70 ? 'High humidity' : currentWeather.humidity < 30 ? 'Low humidity' : 'Comfortable'}
        color="text-blue-400"
        delay={0}
        theme={theme}
      />

      {/* Wind */}
      <MetricWidget
        icon={Wind}
        label="Wind"
        value={Math.round(currentWeather.wind_kph)}
        unit="km/h"
        subValue={`Gusts: ${Math.round(currentWeather.gust_kph)} km/h`}
        color="text-cyan-400"
        delay={0.05}
        theme={theme}
      />

      {/* Pressure */}
      <MetricWidget
        icon={Gauge}
        label="Pressure"
        value={Math.round(currentWeather.pressure_mb)}
        unit="hPa"
        subValue={currentWeather.pressure_mb > 1013 ? 'High pressure' : 'Low pressure'}
        color="text-purple-400"
        delay={0.1}
        theme={theme}
      />

      {/* UV Index */}
      <MetricWidget
        icon={Sun}
        label="UV Index"
        value={uvIndex}
        subValue={getUvLabel(uvIndex)}
        color={getUvColor(uvIndex)}
        delay={0.15}
        theme={theme}
      />

      {/* Visibility */}
      <MetricWidget
        icon={Eye}
        label="Visibility"
        value={currentWeather.vis_km}
        unit="km"
        subValue={currentWeather.vis_km >= 10 ? 'Clear' : currentWeather.vis_km >= 5 ? 'Moderate' : 'Poor'}
        color="text-emerald-400"
        delay={0.2}
        theme={theme}
      />

      {/* Feels Like */}
      <MetricWidget
        icon={Thermometer}
        label="Feels Like"
        value={unit === 'C' ? Math.round(currentWeather.feelslike_c) : Math.round(currentWeather.feelslike_f)}
        unit={`°${unit}`}
        subValue={
          (unit === 'C' ? currentWeather.feelslike_c : currentWeather.feelslike_f) > 
          (unit === 'C' ? currentWeather.temp_c : currentWeather.temp_f) 
            ? 'Warmer than actual' 
            : 'Cooler than actual'
        }
        color="text-orange-400"
        delay={0.25}
        theme={theme}
      />

      {/* Sunrise */}
      {astronomy && (
        <MetricWidget
          icon={Sunrise}
          label="Sunrise"
          value={astronomy.sunrise}
          subValue="Golden hour"
          color="text-amber-400"
          delay={0.3}
          theme={theme}
        />
      )}

      {/* Sunset */}
      {astronomy && (
        <MetricWidget
          icon={Sunset}
          label="Sunset"
          value={astronomy.sunset}
          subValue="Blue hour"
          color="text-rose-400"
          delay={0.35}
          theme={theme}
        />
      )}

      {/* Air Quality - Full Width */}
      {aqi && aqiValue && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className={`col-span-2 md:col-span-4 ${theme.glassBg} ${theme.glassBorder} rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)]`}
          data-testid="aqi-widget"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${aqiColors[aqiValue]?.replace('text-', 'bg-')}`} />
                <span className={`text-xs font-bold uppercase tracking-wider ${theme.textSecondary}`}>
                  Air Quality Index
                </span>
              </div>
              <div className={`text-3xl font-display font-semibold ${aqiColors[aqiValue]} ${theme.textPrimary}`}>
                {aqiLabels[aqiValue]}
              </div>
              <p className={`text-sm mt-1 ${theme.textSecondary}`}>
                EPA Index: {aqiValue} of 6
              </p>
            </div>
            <div className={`text-right ${theme.textSecondary}`}>
              <div className="text-xs space-y-1">
                <p>PM2.5: {aqi.pm2_5?.toFixed(1)} µg/m³</p>
                <p>PM10: {aqi.pm10?.toFixed(1)} µg/m³</p>
                <p>O₃: {aqi.o3?.toFixed(1)} µg/m³</p>
              </div>
            </div>
          </div>
          
          {/* AQI Scale Bar */}
          <div className="mt-4">
            <div className="flex h-2 rounded-full overflow-hidden">
              <div className="flex-1 bg-green-400" />
              <div className="flex-1 bg-yellow-400" />
              <div className="flex-1 bg-orange-400" />
              <div className="flex-1 bg-red-400" />
              <div className="flex-1 bg-purple-400" />
              <div className="flex-1 bg-rose-600" />
            </div>
            <div 
              className="w-3 h-3 bg-white rounded-full border-2 border-gray-800 relative -mt-2.5"
              style={{ marginLeft: `${((aqiValue - 1) / 5) * 100}%`, transform: 'translateX(-50%)' }}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

const BentoWidgetsSkeleton = ({ theme }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[...Array(8)].map((_, i) => (
      <div key={i} className={`${theme.glassBg} ${theme.glassBorder} rounded-2xl p-4 animate-pulse`}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 bg-white/10 rounded" />
          <div className="w-16 h-3 bg-white/10 rounded" />
        </div>
        <div className="w-20 h-8 bg-white/10 rounded mb-2" />
        <div className="w-24 h-3 bg-white/10 rounded" />
      </div>
    ))}
  </div>
);

export default BentoWidgets;
