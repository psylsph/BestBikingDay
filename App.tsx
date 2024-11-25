import React, { useState, useEffect } from 'react';
import { StyleSheet, View, StatusBar, Dimensions, Platform, ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedScrollHandler } from 'react-native-reanimated';
import { fetchWeatherForecast, WeatherForecast } from './app/services/weatherService';
import HomeScreen from './app/index';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

function App() {
  const [forecasts, setForecasts] = useState<WeatherForecast[]>([]);
  const [location, setLocation] = useState<string>('');
  const [forecastTime, setForecastTime] = useState<string>('');

  useEffect(() => {
    const loadForecast = async () => {
      try {
        const data = await fetchWeatherForecast();
        setForecasts(data.forecasts);
        setLocation(data.location);
        setForecastTime(data.forecastTime);
      } catch (error: any) {
        console.error('Error loading forecast:', error);
      }
    };

    loadForecast();
  }, []);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    'worklet';
    // Handle scroll events if needed
  });

  const ScrollComponent = Platform.select({
    web: ScrollView,
    default: Animated.ScrollView,
  });

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#0d1b2a', '#1b263b']}
          style={StyleSheet.absoluteFillObject}
        />
        <GestureHandlerRootView style={styles.gestureHandler}>
          <ScrollComponent
            onScroll={Platform.OS === 'web' ? undefined : scrollHandler}
            scrollEventThrottle={16}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <HomeScreen 
              forecasts={forecasts} 
              location={location} 
              forecastTime={forecastTime}
            />
          </ScrollComponent>
        </GestureHandlerRootView>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1b263b',
    ...(Platform.OS === 'web' ? {
      height: '100vh',
      overflow: 'auto',
    } : {}),
  },
  gestureHandler: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web' ? {
      minHeight: '100%',
    } : {}),
  },
});

let AppEntryPoint = App;

// Add web-specific initialization
if (Platform.OS === 'web') {
  AppEntryPoint = () => {
    useEffect(() => {
      // Ensure the root element exists
      const rootElement = document.getElementById('root');
      if (!rootElement) {
        const root = document.createElement('div');
        root.id = 'root';
        document.body.appendChild(root);
      }
    }, []);

    return <App />;
  };
}

export default AppEntryPoint;
