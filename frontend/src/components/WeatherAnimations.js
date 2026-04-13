import React from 'react';
import { motion } from 'framer-motion';
import { useWeather } from '../context/WeatherContext';

// Rain drops animation
const RainAnimation = () => {
  const drops = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 2,
    duration: 0.5 + Math.random() * 0.5,
    opacity: 0.3 + Math.random() * 0.4
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {drops.map((drop) => (
        <motion.div
          key={drop.id}
          className="absolute w-0.5 h-8 bg-gradient-to-b from-blue-300/0 via-blue-300 to-blue-300/0"
          style={{ left: drop.left, opacity: drop.opacity }}
          initial={{ y: '-100%' }}
          animate={{ y: '100vh' }}
          transition={{
            duration: drop.duration,
            repeat: Infinity,
            delay: drop.delay,
            ease: 'linear'
          }}
        />
      ))}
    </div>
  );
};

// Snow animation
const SnowAnimation = () => {
  const flakes = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 5,
    duration: 5 + Math.random() * 5,
    size: 4 + Math.random() * 4,
    opacity: 0.4 + Math.random() * 0.4
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {flakes.map((flake) => (
        <motion.div
          key={flake.id}
          className="absolute rounded-full bg-white"
          style={{ 
            left: flake.left, 
            opacity: flake.opacity,
            width: flake.size,
            height: flake.size
          }}
          initial={{ y: '-10%', x: 0 }}
          animate={{ 
            y: '100vh', 
            x: [0, 20, -20, 10, 0]
          }}
          transition={{
            duration: flake.duration,
            repeat: Infinity,
            delay: flake.delay,
            ease: 'linear',
            x: {
              duration: flake.duration,
              repeat: Infinity,
              ease: 'easeInOut'
            }
          }}
        />
      ))}
    </div>
  );
};

// Clouds animation
const CloudsAnimation = () => {
  const clouds = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    top: `${10 + Math.random() * 30}%`,
    delay: i * 8,
    duration: 40 + Math.random() * 20,
    scale: 0.5 + Math.random() * 0.5,
    opacity: 0.2 + Math.random() * 0.3
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {clouds.map((cloud) => (
        <motion.div
          key={cloud.id}
          className="absolute"
          style={{ top: cloud.top, opacity: cloud.opacity }}
          initial={{ x: '-20%' }}
          animate={{ x: '120vw' }}
          transition={{
            duration: cloud.duration,
            repeat: Infinity,
            delay: cloud.delay,
            ease: 'linear'
          }}
        >
          <svg 
            viewBox="0 0 200 100" 
            className="w-48 h-24"
            style={{ transform: `scale(${cloud.scale})` }}
          >
            <ellipse cx="60" cy="70" rx="50" ry="30" fill="rgba(255,255,255,0.8)" />
            <ellipse cx="100" cy="50" rx="60" ry="40" fill="rgba(255,255,255,0.9)" />
            <ellipse cx="150" cy="65" rx="45" ry="25" fill="rgba(255,255,255,0.7)" />
            <ellipse cx="80" cy="55" rx="40" ry="30" fill="rgba(255,255,255,0.85)" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

// Stars animation for night
const StarsAnimation = () => {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 60}%`,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 2,
    size: 1 + Math.random() * 2
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{ 
            left: star.left, 
            top: star.top,
            width: star.size,
            height: star.size
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
};

// Sun rays animation
const SunRaysAnimation = () => {
  return (
    <div className="absolute top-0 right-0 w-96 h-96 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute -top-20 -right-20 w-80 h-80"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      >
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 w-1 h-40 bg-gradient-to-b from-amber-200/30 to-transparent origin-bottom"
            style={{ transform: `rotate(${i * 30}deg) translateX(-50%)` }}
          />
        ))}
      </motion.div>
      <motion.div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-radial from-amber-100/50 to-transparent"
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
};

const WeatherAnimations = () => {
  const { currentWeather, theme } = useWeather();

  if (!currentWeather) return null;

  const condition = currentWeather.condition?.text?.toLowerCase() || '';
  const isDay = currentWeather.is_day;

  // Determine which animation to show
  const showRain = condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunder');
  const showSnow = condition.includes('snow') || condition.includes('sleet') || condition.includes('ice');
  const showClouds = condition.includes('cloud') || condition.includes('overcast');
  const showStars = !isDay;
  const showSun = isDay && (condition.includes('sunny') || condition.includes('clear'));

  return (
    <>
      {showRain && <RainAnimation />}
      {showSnow && <SnowAnimation />}
      {showClouds && !showRain && !showSnow && <CloudsAnimation />}
      {showStars && <StarsAnimation />}
      {showSun && <SunRaysAnimation />}
    </>
  );
};

export default WeatherAnimations;
