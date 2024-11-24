import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WeatherForecast, fetchWeatherForecast } from '../services/weatherService';

interface WeatherContextType {
  forecasts: WeatherForecast[];
  error: string | null;
  loading: boolean;
  refreshWeather: () => Promise<void>;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [forecasts, setForecasts] = useState<WeatherForecast[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadWeatherData = async () => {
    try {
      setLoading(true);
      const data = await fetchWeatherForecast();
      setForecasts(data);
      setError(null);
    } catch (err) {
      setError('Failed to load weather data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeatherData();
  }, []);

  const value = {
    forecasts,
    error,
    loading,
    refreshWeather: loadWeatherData,
  };

  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
}

export default WeatherProvider;
