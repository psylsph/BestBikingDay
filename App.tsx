import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, StatusBar, Dimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedScrollHandler } from 'react-native-reanimated';
import { useFonts } from 'expo-font';
import WeatherCard from './components/WeatherCard';
import { fetchWeatherForecast, WeatherForecast } from './app/services/weatherService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function App() {
  const [forecasts, setForecasts] = useState<WeatherForecast[]>([]);
  const [location, setLocation] = useState<string>('');
  const [forecastTime, setForecastTime] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    'Inter-Bold': require('./assets/fonts/Inter-Bold.otf'),
    'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.otf'),
    'Inter-Regular': require('./assets/fonts/Inter-Regular.otf'),
  });

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    try {
      const data = await fetchWeatherForecast();
      setForecasts(data.forecasts);
      setLocation(data.location);
      setForecastTime(data.forecastTime);
      setError(null);
    } catch (err) {
      setError('Failed to load weather data. Please try again later.');
    }
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      'worklet';
      // Handle scroll if needed
    },
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Best Biking Day</Text>
          <Text style={styles.subtitle}>3-Day Weather Forecast • {location} {forecastTime && `[${forecastTime}]`}</Text>
        </View>
        
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <View style={styles.cardsContainer}>
            {forecasts.map((forecast, index) => (
              <View key={index} style={styles.cardWrapper}>
                <WeatherCard forecast={forecast} />
              </View>
            ))}
          </View>
        )}
      </Animated.ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1b2a',
  },
  scrollView: {
    flex: 1,
    height: SCREEN_HEIGHT,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textAlign: 'left',
    letterSpacing: -1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#e3f2fd',
    letterSpacing: 0.2,
    lineHeight: 22,
  },
  cardsContainer: {
    padding: 12,
    paddingBottom: 40,
  },
  cardWrapper: {
    marginBottom: 12,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
});
