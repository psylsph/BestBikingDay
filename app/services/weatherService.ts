import axios from 'axios';
import * as Location from 'expo-location';

const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;

export interface WeatherForecast {
  date: string;
  forecastTime: string;
  temperature: number;
  temp: {
    day: number;
    min: number;
    max: number;
  };
  weather: {
    description: string;
    icon: string;
    main: string;
  };
  wind_speed: number;
  uvi: number;
  precipitation: number;
  bikingScore: {
    score: number;
    message: string;
  };
  sunrise: string;
  sunset: string;
  hourlyForecasts: HourlyForecast[];
  bestHours: BestHour[];
}

export interface HourlyForecast {
  time: string;
  score: number;
  message: string;
  temperature: number;
  windSpeed: number;
  precipitation: number;
  description: string;
}

export interface BestHour {
  time: string;
  score: number;
  temperature: number;
}

interface LocationInfo {
  coords: {
    latitude: number;
    longitude: number;
  };
  city: string;
}

const calculateBikingScore = (temp: number, windSpeed: number, precipitation: number, weatherMain: string): { score: number; message: string } => {
  let score = 100;
  let messages: string[] = [];

  // Temperature score (ideal range: 15-25°C)
  if (temp < 5) {
    score -= 25;
    messages.push("Too cold");
  } else if (temp < 10) {
    score -= 15;
    messages.push("Bit chilly");
  } else if (temp > 35) {
    score -= 25;
    messages.push("Too hot");
  } else if (temp > 30) {
    score -= 15;
    messages.push("Quite warm");
  }

  // Wind speed score (ideal: < 20 km/h)
  if (windSpeed > 40) {
    score -= 30;
    messages.push("Very windy");
  } else if (windSpeed > 30) {
    score -= 20;
    messages.push("Windy");
  } else if (windSpeed > 20) {
    score -= 10;
    messages.push("Breezy");
  }

  // Precipitation score (stricter for rain)
  if (precipitation > 10) {
    score -= 60;
    messages.push("Heavy rain");
  } else if (precipitation > 5) {
    score -= 45;
    messages.push("Moderate rain");
  } else if (precipitation > 2) {
    score -= 30;
    messages.push("Light rain");
  } else if (precipitation > 0) {
    score -= 15;
    messages.push("Slight chance of rain");
  }

  // Weather condition adjustments
  switch (weatherMain.toLowerCase()) {
    case 'thunderstorm':
      score -= 60;
      messages.push("Thunderstorm");
      break;
    case 'snow':
      score -= 45;
      messages.push("Snowing");
      break;
    case 'rain':
      score -= 40;
      messages.push("Rainy");
      break;
    case 'drizzle':
      score -= 25;
      messages.push("Drizzling");
      break;
    case 'fog':
    case 'mist':
      score -= 10;
      messages.push("Poor visibility");
      break;
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  // Get the main message
  const message = messages.length > 0 ? messages[0] : "Perfect for biking!";

  return { score, message };
}

const getCurrentLocation = async (): Promise<LocationInfo> => {
  let permissionError = false;
  
  try {
    console.log('Step 1: Checking location permissions...');
    let { status } = await Location.requestForegroundPermissionsAsync();
    console.log('Permission status:', status);
    
    if (status !== 'granted') {
      permissionError = true;
      throw new Error('Location permission denied by user');
    }

    console.log('Step 2: Checking if location services are enabled...');
    const enabled = await Location.hasServicesEnabledAsync();
    console.log('Location services enabled:', enabled);
    
    if (!enabled) {
      throw new Error('Location services are disabled on device');
    }

    console.log('Step 3: Getting location...');
    let location;
    try {
      const lastKnownLocation = await Location.getLastKnownPositionAsync();
      if (lastKnownLocation) {
        console.log('Found last known location:', lastKnownLocation.coords);
        location = lastKnownLocation;
      } else {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          mayShowUserSettingsDialog: true
        });
        console.log('Got new high accuracy location:', location.coords);
      }
    } catch (e) {
      console.warn('High accuracy location failed:', e);
      console.log('Falling back to balanced accuracy...');
      location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        mayShowUserSettingsDialog: true
      });
      console.log('Got balanced accuracy location:', location.coords);
    }

    if (!location) {
      throw new Error('Failed to get location coordinates');
    }

    return {
      coords: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      },
      city: '' // Will be filled in by fetchWeatherForecast
    };

  } catch (error) {
    const errorMessage = permissionError ? 
      'Please enable location permissions in your device settings to get local weather data' :
      'Could not get your location. Please check if location services are enabled';
    console.error('Location error:', error, errorMessage);
    throw new Error(errorMessage);
  }
};

const fetchWeatherForecast = async (): Promise<{ location: string; forecasts: WeatherForecast[]; forecastTime: string }> => {
  let location;
  let usingFallback = false;

  try {
    console.log('Attempting to get current location...');
    location = await getCurrentLocation();
    console.log('Successfully got location:', location);
  } catch (error: any) {
    console.error('Location error:', error.message);
    if (error.message.includes('permission') || error.message.includes('enable')) {
      console.log('Permission or settings error - propagating to UI');
      throw error;
    }
    console.log('Using fallback location (New York)');
    usingFallback = true;
    location = {
      coords: {
        latitude: 40.7128,
        longitude: -74.0060
      },
      city: 'New York'
    };
  }

  try {
    console.log('Fetching weather data for:', location.coords);
    
    // Get current weather for location name and sunrise/sunset times
    const currentResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${location.coords.latitude}&lon=${location.coords.longitude}&units=metric&appid=${API_KEY}`
    );

    // Update location with city name from OpenWeatherMap
    location.city = currentResponse.data.name || location.city;
    console.log('Got city name from OpenWeatherMap:', location.city);

    // Get forecast data
    const forecastResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${location.coords.latitude}&lon=${location.coords.longitude}&units=metric&appid=${API_KEY}`
    );

    if (!forecastResponse.data || !forecastResponse.data.list) {
      throw new Error('Invalid weather data received');
    }

    const forecastTime = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    // Group forecasts by day
    const dailyForecasts = new Map<string, any[]>();
    
    forecastResponse.data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
      
      if (!dailyForecasts.has(dateKey)) {
        dailyForecasts.set(dateKey, []);
      }
      dailyForecasts.get(dateKey)?.push(item);
    });

    // Process each day's forecast
    const forecasts: WeatherForecast[] = [];
    const now = new Date();
    const currentSunset = new Date(currentResponse.data.sys.sunset * 1000);
    
    for (const [date, items] of dailyForecasts) {
      if (forecasts.length >= 3) break; // Only show 3 days

      // Get the first timestamp for this day
      const dayStart = new Date(items[0].dt * 1000);
      dayStart.setHours(0, 0, 0, 0);

      // Skip today if it's after sunset
      if (dayStart.getDate() === now.getDate() && 
          dayStart.getMonth() === now.getMonth() && 
          dayStart.getFullYear() === now.getFullYear() && 
          now > currentSunset) {
        console.log('Skipping today as it is after sunset');
        continue;
      }

      // Calculate sunrise and sunset times for this specific day
      const daysSinceToday = Math.round((dayStart.getTime() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
      const baseSunrise = new Date(currentResponse.data.sys.sunrise * 1000);
      const baseSunset = new Date(currentResponse.data.sys.sunset * 1000);
      
      const sunriseDate = new Date(baseSunrise.getTime() + daysSinceToday * 24 * 60 * 60 * 1000);
      const sunsetDate = new Date(baseSunset.getTime() + daysSinceToday * 24 * 60 * 60 * 1000);

      console.log('Processing forecasts for date:', date);
      console.log('Day start:', dayStart.toLocaleString());
      console.log('Days since today:', daysSinceToday);
      console.log('Sunrise:', sunriseDate.toLocaleString());
      console.log('Sunset:', sunsetDate.toLocaleString());
      console.log('Total forecast items:', items.length);

      // Process hourly forecasts between sunrise and sunset
      const hourlyForecasts: HourlyForecast[] = [];
      
      // Find the closest forecast time to sunrise
      const startIndex = items.findIndex(item => {
        const itemTime = new Date(item.dt * 1000);
        return itemTime >= sunriseDate;
      });

      console.log('Start index:', startIndex);

      if (startIndex !== -1) {
        for (let i = startIndex; i < items.length; i++) {
          const itemTime = new Date(items[i].dt * 1000);
          
          // Stop if we've passed sunset
          if (itemTime > sunsetDate) {
            console.log('Reached sunset at index:', i);
            break;
          }

          // Include all hourly forecasts
          const hourlyScore = calculateBikingScore(
            items[i].main.temp,
            items[i].wind.speed,
            items[i].rain?.['3h'] || items[i].snow?.['3h'] ? 100 : 0,
            items[i].weather[0].main
          );

          hourlyForecasts.push({
            time: itemTime.toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            }),
            score: hourlyScore.score,
            message: hourlyScore.message,
            temperature: Math.round(items[i].main.temp),
            windSpeed: Math.round(items[i].wind.speed * 3.6), // Convert m/s to km/h
            precipitation: items[i].rain?.['3h'] || items[i].snow?.['3h'] ? 100 : 0,
            description: items[i].weather[0].description
          });
        }
      }

      console.log('Generated hourly forecasts:', hourlyForecasts);

      // Get the top 3 best cycling hours while preserving time order
      const bestHours = hourlyForecasts
        .map((forecast, index) => ({ ...forecast, originalIndex: index }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .sort((a, b) => a.originalIndex - b.originalIndex)
        .map(forecast => ({
          time: forecast.time,
          score: forecast.score,
          temperature: forecast.temperature
        }));

      console.log('Best cycling hours (in time order):', bestHours);

      // Use the highest score of the day as the summary score
      const bestScore = Math.max(...hourlyForecasts.map(f => f.score));
      const bestScoreHour = hourlyForecasts.find(f => f.score === bestScore)!;
      const bikingScore = {
        score: bestScore,
        message: calculateBikingScore(
          bestScoreHour.temperature,
          bestScoreHour.windSpeed / 3.6, // Convert back to m/s for calculation
          bestScoreHour.precipitation,
          bestScoreHour.description
        ).message
      };

      forecasts.push({
        date,
        forecastTime,
        temperature: Math.round(items[0].main.temp),
        temp: {
          day: Math.round(items[0].main.temp),
          min: Math.round(Math.min(...items.map(item => item.main.temp))),
          max: Math.round(Math.max(...items.map(item => item.main.temp)))
        },
        weather: {
          description: items[0].weather[0].description,
          icon: items[0].weather[0].icon,
          main: items[0].weather[0].main
        },
        wind_speed: Math.round(items[0].wind.speed * 3.6),
        uvi: items[0].uvi || 0,
        precipitation: items.some(item => 
          item.rain?.['3h'] || item.snow?.['3h'] || 
          item.weather[0].main.toLowerCase().includes('rain') ||
          item.weather[0].main.toLowerCase().includes('snow')
        ) ? 100 : 0,
        bikingScore,
        sunrise: sunriseDate.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        sunset: sunsetDate.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        hourlyForecasts,
        bestHours
      });
    }

    return {
      location: location.city,
      forecasts,
      forecastTime,
    };
  } catch (error) {
    console.error('Weather API error:', error);
    throw new Error('Failed to fetch weather data. Please try again later.');
  }
};

const weatherService = {
  fetchWeatherForecast,
  calculateBikingScore
};

export default weatherService;
export { fetchWeatherForecast, calculateBikingScore };
