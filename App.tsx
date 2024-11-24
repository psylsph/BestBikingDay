import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Text, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import WeatherCard from './components/WeatherCard';
import { fetchWeatherForecast, WeatherForecast } from './app/services/weatherService';

export default function App() {
  const [forecasts, setForecasts] = useState<WeatherForecast[]>([]);
  const [error, setError] = useState<string | null>(null);

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
      console.error(err);
    }
  };

  return (
    <LinearGradient
      colors={['#1a1a1a', '#2d2d2d']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <View style={styles.header}>
        <Text style={styles.title}>Best Biking Day</Text>
        <Text style={styles.subtitle}>5-Day Weather Forecast</Text>
      </View>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {forecasts.map((forecast, index) => (
            <WeatherCard key={index} forecast={forecast} />
          ))}
        </ScrollView>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff99',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
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
});
