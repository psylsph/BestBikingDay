import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import WeatherCard from '../components/WeatherCard';
import { fetchWeatherForecast, WeatherForecast } from '../app/services/weatherService';

export default function HomeScreen() {
  const [forecasts, setForecasts] = useState<WeatherForecast[]>([]);
  const [error, setError] = useState<string | null>(null);

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
    try {
      const data = await fetchWeatherForecast();
      setForecasts(data);
      setError(null);
    } catch (err) {
      setError('Failed to load weather data. Please try again later.');
    }
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#1a1a1a', '#2d2d2d']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Best Biking Day</Text>
        <Text style={styles.subtitle}>5-Day Weather Forecast</Text>
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
