import axios from 'axios';
import * as Location from 'expo-location';

const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;

export interface WeatherForecast {
  date: string;
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
}

interface LocationInfo {
  coords: {
    latitude: number;
    longitude: number;
  };
  city: string;
}

function calculateBikingScore(temp: number, windSpeed: number, precipitation: number, weatherMain: string) {
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

export async function getCurrentLocation(): Promise<LocationInfo> {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return {
        coords: {
          latitude: 40.7128,
          longitude: -74.0060
        },
        city: 'New York'
      };
    }

    const location = await Location.getCurrentPositionAsync({});

    // Get city name from coordinates
    const response = await axios.get(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${location.coords.latitude}&lon=${location.coords.longitude}&limit=1&appid=${API_KEY}`
    );

    if (!response.data || response.data.length === 0) {
      throw new Error('Failed to get city name');
    }

    return {
      coords: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      },
      city: response.data[0].name
    };
  } catch (error) {
    return {
      coords: {
        latitude: 40.7128,
        longitude: -74.0060
      },
      city: 'New York'
    };
  }
}

export async function fetchWeatherForecast(): Promise<{ location: string; forecasts: WeatherForecast[] }> {
  try {
    const location = await getCurrentLocation();
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${location.coords.latitude}&lon=${location.coords.longitude}&units=metric&appid=${API_KEY}`
    );

    if (!response.data || !response.data.list) {
      throw new Error('Invalid weather data received');
    }

    // Group forecasts by day
    const dailyForecasts = new Map<string, any[]>();
    
    response.data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!dailyForecasts.has(dateKey)) {
        dailyForecasts.set(dateKey, []);
      }
      
      dailyForecasts.get(dateKey)?.push(item);
    });

    // Process daily forecasts
    const forecasts = Array.from(dailyForecasts.entries())
      .slice(0, 3)
      .map(([dateStr, items]) => {
        const date = new Date(dateStr);
        const dayStart = new Date(date);
        dayStart.setHours(6, 0, 0, 0); // 6 AM
        const dayEnd = new Date(date);
        dayEnd.setHours(20, 0, 0, 0); // 8 PM

        const formatTime = (date: Date) => {
          return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          });
        };

        // Calculate daily averages
        const avgTemp = items.reduce((sum, item) => sum + item.main.temp, 0) / items.length;
        const avgWindSpeed = items.reduce((sum, item) => sum + item.wind.speed, 0) / items.length;
        const precipitation = items.reduce((sum, item) => {
          const pop = item.pop || 0; // Probability of precipitation
          return Math.max(sum, pop);
        }, 0);

        // Get most common weather condition
        const weatherCounts = items.reduce((acc: { [key: string]: number }, item) => {
          const weather = item.weather[0];
          acc[weather.main] = (acc[weather.main] || 0) + 1;
          return acc;
        }, {});

        const mostCommonWeather = Object.entries(weatherCounts)
          .sort(([, a], [, b]) => b - a)[0][0];

        const weatherInfo = items[0].weather[0];

        // Estimate UV index based on weather conditions and cloud cover
        let baseUVI = 6; // Default moderate-high UV index
        const clouds = items.reduce((sum, item) => sum + item.clouds.all, 0) / items.length;
        
        // Reduce UV based on cloud cover
        baseUVI *= (1 - clouds / 200); // clouds.all is percentage, we want less impact
        
        // Adjust based on weather conditions
        if (mostCommonWeather === 'Rain' || mostCommonWeather === 'Snow') {
          baseUVI *= 0.5;
        } else if (mostCommonWeather === 'Clouds') {
          baseUVI *= 0.7;
        }
        
        // Ensure UV index is within bounds
        const uvi = Math.max(1, Math.min(11, Math.round(baseUVI)));

        const bikingScore = calculateBikingScore(
          avgTemp,
          avgWindSpeed,
          precipitation * 100,
          mostCommonWeather
        );

        return {
          date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          temperature: avgTemp,
          temp: {
            day: avgTemp,
            min: Math.min(...items.map(item => item.main.temp_min)),
            max: Math.max(...items.map(item => item.main.temp_max)),
          },
          weather: {
            description: weatherInfo.description,
            icon: weatherInfo.icon,
            main: weatherInfo.main,
          },
          wind_speed: avgWindSpeed,
          uvi,
          precipitation: precipitation * 100,
          bikingScore,
          sunrise: formatTime(dayStart),
          sunset: formatTime(dayEnd),
        };
      })
      .filter((forecast): forecast is WeatherForecast => forecast !== null);

    return {
      location: location.city,
      forecasts,
    };
  } catch (error) {
    console.error('Weather error:', error);
    throw new Error('Failed to fetch weather data');
  }
}
