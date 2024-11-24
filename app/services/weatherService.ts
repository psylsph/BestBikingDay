import axios, { AxiosInstance } from 'axios';
import { OPENWEATHER_API_KEY } from '@env';

const API_KEY = OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherForecast {
  date: string;
  temp: {
    day: number;
    min: number;
    max: number;
  };
  weather: {
    main: string;
    description: string;
    icon: string;
  };
  wind_speed: number;
  humidity: number;
  precipitation: number;
  bikingScore: {
    score: number;
    message: string;
  };
  dayHours: string;
}

function calculateBikingScore(temp: number, windSpeed: number, precipitation: number, weatherMain: string): { score: number; message: string } {
  let score = 100;
  let messages: string[] = [];

  // Temperature score (ideal range: 15-22°C)
  if (temp <= 0) {
    score -= 70;
    messages.push("Freezing");
  } else if (temp <= 5) {
    score -= 50;
    messages.push("Very cold");
  } else if (temp <= 10) {
    score -= 30;
    messages.push("Cold");
  } else if (temp <= 13) {
    score -= 15;
    messages.push("Cool");
  } else if (temp > 30) {
    score -= 40;
    messages.push("Too hot");
  } else if (temp > 25) {
    score -= 15;
    messages.push("Warm");
  } else if (temp > 22) {
    score -= 5;
    messages.push("Bit warm");
  }

  // Wind speed score (ideal: < 15 km/h)
  // Convert m/s to km/h (multiply by 3.6)
  const windSpeedKmh = windSpeed * 3.6;
  if (windSpeedKmh > 40) {
    score -= 50;
    messages.push("Dangerous winds");
  } else if (windSpeedKmh > 30) {
    score -= 35;
    messages.push("Very windy");
  } else if (windSpeedKmh > 20) {
    score -= 20;
    messages.push("Windy");
  } else if (windSpeedKmh > 15) {
    score -= 10;
    messages.push("Breezy");
  }

  // Wind chill effect (when temperature is below 10°C)
  if (temp < 10 && windSpeedKmh > 15) {
    score -= 15;
    messages.push("Wind chill");
  }

  // Precipitation and weather conditions
  if (precipitation > 5) {
    score -= 50;
    messages.push("Heavy rain");
  } else if (precipitation > 2) {
    score -= 35;
    messages.push("Rainy");
  } else if (precipitation > 0) {
    score -= 20;
    messages.push("Light rain");
  }

  // Additional weather conditions
  const weatherLower = weatherMain.toLowerCase();
  if (weatherLower.includes('snow') || weatherLower.includes('sleet')) {
    score -= 70;
    messages.push("Snowing");
  } else if (weatherLower.includes('thunderstorm')) {
    score -= 80;
    messages.push("Thunderstorm");
  } else if (weatherLower.includes('drizzle')) {
    score -= 25;
    messages.push("Drizzle");
  } else if (weatherLower.includes('fog') || weatherLower.includes('mist')) {
    score -= 20;
    messages.push("Poor visibility");
  } else if (weatherLower.includes('ice') || weatherLower.includes('hail')) {
    score -= 90;
    messages.push("Dangerous conditions");
  }

  // Ensure score stays within 0-100
  score = Math.max(0, Math.min(100, score));

  // Generate message based on score
  let finalMessage = "";
  if (score >= 80) {
    finalMessage = "Perfect for cycling!";
  } else if (score >= 60) {
    finalMessage = "Good cycling conditions";
  } else if (score >= 40) {
    finalMessage = "Moderate conditions";
  } else if (score >= 20) {
    finalMessage = "Challenging conditions";
  } else {
    finalMessage = "Not recommended";
  }

  // Add specific weather messages if score is not perfect
  if (score < 80 && messages.length > 0) {
    finalMessage += ` (${messages.join(", ")})`;
  }

  return { score, message: finalMessage };
}

export const getWeatherForecast = async (lat: number, lon: number): Promise<WeatherForecast[]> => {
  try {
    const response = await axios.get(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );

    // Group forecasts by day
    const dailyForecasts = new Map<string, any>();
    
    // First pass: collect all data points for each day
    response.data.list.forEach((forecast: any) => {
      const date = new Date(forecast.dt * 1000);
      const hours = date.getHours();
      const dateKey = date.toLocaleDateString();
      
      // Only consider forecasts between 8 AM and 6 PM
      if (hours >= 8 && hours <= 18) {
        if (!dailyForecasts.has(dateKey)) {
          dailyForecasts.set(dateKey, {
            date: date,
            forecasts: [],
          });
        }
        
        dailyForecasts.get(dateKey).forecasts.push({
          temp: forecast.main.temp,
          temp_min: forecast.main.temp_min,
          temp_max: forecast.main.temp_max,
          wind_speed: forecast.wind.speed,
          weather: forecast.weather[0],
          precipitation: (forecast.rain?.['3h'] || 0) + (forecast.snow?.['3h'] || 0),
          humidity: forecast.main.humidity,
          hour: hours,
        });
      }
    });

    // Second pass: calculate daily averages and create final forecast objects
    const processedForecasts = Array.from(dailyForecasts.entries()).map(([_, dayData]) => {
      const forecasts = dayData.forecasts;
      const date = dayData.date;
      
      // If no daytime forecasts available, skip this day
      if (forecasts.length === 0) {
        return null;
      }

      // Calculate averages for daytime hours
      const avgTemp = forecasts.reduce((sum: number, f: any) => sum + f.temp, 0) / forecasts.length;
      const avgWindSpeed = forecasts.reduce((sum: number, f: any) => sum + f.wind_speed, 0) / forecasts.length;
      const totalPrecipitation = forecasts.reduce((sum: number, f: any) => sum + f.precipitation, 0);
      
      // Get min/max temperatures during daytime
      const minTemp = Math.min(...forecasts.map((f: any) => f.temp_min));
      const maxTemp = Math.max(...forecasts.map((f: any) => f.temp_max));
      
      // Get the most common weather condition during daytime
      const weatherCounts = forecasts.reduce((acc: any, f: any) => {
        acc[f.weather.main] = (acc[f.weather.main] || 0) + 1;
        return acc;
      }, {});
      const mainWeather = Object.entries(weatherCounts)
        .sort(([,a]: any, [,b]: any) => b - a)[0][0];
      
      // Get the corresponding weather description and icon
      const weatherDetails = forecasts.find((f: any) => f.weather.main === mainWeather)?.weather;

      // Format the date
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const formattedDate = `${dayOfWeek}, ${monthDay}`;

      // Calculate biking score based on daytime conditions
      const bikingScore = calculateBikingScore(
        avgTemp,
        avgWindSpeed,
        totalPrecipitation,
        mainWeather
      );

      return {
        date: formattedDate,
        temp: {
          day: avgTemp,
          min: minTemp,
          max: maxTemp,
        },
        weather: {
          main: weatherDetails.main,
          description: weatherDetails.description,
          icon: weatherDetails.icon,
        },
        wind_speed: avgWindSpeed,
        humidity: forecasts[0].humidity,
        precipitation: totalPrecipitation,
        bikingScore,
        dayHours: `8 AM - 6 PM`,
      };
    }).filter(Boolean); // Remove any null entries

    // Sort by date and return first 5 days
    const currentTime = new Date();
    const isAfter6PM = currentTime.getHours() >= 18;
    const currentDate = currentTime.toISOString().split('T')[0];

    // Filter out today's forecast if it's after 6 PM
    return processedForecasts.filter(forecast => {
      if (isAfter6PM) {
        return forecast.date !== currentDate;
      }
      return true;
    }).slice(0, 5);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

// Default to New York City coordinates
export const fetchWeatherForecast = async (): Promise<WeatherForecast[]> => {
  return getWeatherForecast(40.7128, -74.0060);
};
