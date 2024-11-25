import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import WeatherCard from '../components/WeatherCard';
import weatherService, { WeatherForecast } from './services/weatherService';

export default function HomeScreen() {
  const [forecasts, setForecasts] = useState<WeatherForecast[]>([]);
  const [location, setLocation] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      height: '100%',
    },
    header: {
      paddingTop: 40,
      paddingBottom: 15,
      paddingHorizontal: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#ffffff',
      textAlign: 'left',
    },
    subtitle: {
      fontSize: 14,
      color: '#ffffff99',
      marginTop: 4,
    },
    content: {
      flex: 1,
      padding: 12,
      flexDirection: 'column',
      gap: 12,
    },
    cardWrapper: {
      width: '100%',
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
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
        <View style={styles.header}>
          <Text style={styles.title}>Best Biking Day</Text>
        </View>
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
      <View style={styles.header}>
        <Text style={styles.title}>Best Biking Day</Text>
        <Text style={styles.subtitle}>3-Day Weather Forecast • {location}</Text>
      </View>
      {forecasts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      ) : (
        <View style={styles.content}>
          {forecasts.map((forecast, index) => (
            <View key={index} style={styles.cardWrapper}>
              <WeatherCard forecast={forecast} />
            </View>
          ))}
        </View>
      )}
    </LinearGradient>
  );
}
