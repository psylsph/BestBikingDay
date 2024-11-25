import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import WeatherCard from '../components/WeatherCard';
import weatherService, { WeatherForecast } from './services/weatherService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HomeScreenProps {
  forecasts: WeatherForecast[];
  location: string;
  forecastTime: string;
}

export default function HomeScreen() {
  const [forecasts, setForecasts] = useState<WeatherForecast[]>([]);
  const [location, setLocation] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      minHeight: '100%',
    },
    header: {
      paddingVertical: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    location: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#ffffff',
      textAlign: 'center',
    },
    cardsContainer: {
      flex: 1,
      paddingHorizontal: 12,
      gap: 8,
      backgroundColor: 'transparent',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    errorText: {
      color: '#ff6b6b',
      fontSize: 16,
      textAlign: 'center',
    },
    footer: {
      height: 40,
    },
  });

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await weatherService.fetchWeatherForecast();
      setForecasts(data.forecasts);
      setLocation(data.location);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load weather data. Please try again later.';
      setError(errorMessage);
      setForecasts([]);
      setLocation('');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <LinearGradient
        colors={['#0d1b2a', '#1b263b']}
        style={styles.container}
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#0d1b2a', '#1b263b']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.location}>{location}</Text>
        </View>
        {forecasts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        ) : (
          <View style={styles.cardsContainer}>
            {forecasts.map((forecast, index) => (
              <WeatherCard key={index} forecast={forecast} />
            ))}
          </View>
        )}
        <View style={styles.footer} />
      </View>
    </LinearGradient>
  );
}
