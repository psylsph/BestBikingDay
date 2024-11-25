const axios = require('axios');
require('dotenv').config();

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

if (!OPENWEATHER_API_KEY) {
    throw new Error('OPENWEATHER_API_KEY is not set in environment variables');
}

async function fetchWeatherForecast() {
    try {
        console.log('Fetching location data...');
        // First, get the current location
        const locationResponse = await axios.get('http://ip-api.com/json');
        const { lat, lon, city } = locationResponse.data;
        console.log('Location data:', { lat, lon, city });

        console.log('Fetching current weather...');
        // Get current weather for sunrise/sunset times
        const currentResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
        );
        console.log('Current weather received');

        console.log('Fetching forecast data...');
        // Get 5-day forecast
        const forecastResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
        );
        console.log('Forecast data received');

        // Process forecasts
        const forecasts = processForecasts(forecastResponse.data.list, currentResponse.data);
        console.log(`Processed ${forecasts.length} days of forecasts`);

        return {
            location: city,
            forecasts,
            forecastTime: new Date().toLocaleTimeString('en-US', {
                hour: 'numeric',
                hour12: true
            })
        };
    } catch (error) {
        console.error('Error in fetchWeatherForecast:', {
            message: error.message,
            response: error.response?.data
        });
        throw new Error(`Failed to fetch weather data: ${error.message}`);
    }
}

function estimateUVIndex(temp, clouds, time) {
    // Base UV index based on time of day (assuming max UV at noon)
    const hour = time.getHours();
    let baseUVI = 0;
    
    if (hour >= 6 && hour <= 18) {
        // Peak UV at noon (hour 12)
        const hourFromNoon = Math.abs(12 - hour);
        baseUVI = 10 * (1 - (hourFromNoon / 6));
    }

    // Temperature factor (higher temp usually means clearer skies)
    const tempFactor = Math.max(0, Math.min(1, (temp + 10) / 40));
    
    // Cloud cover factor (0-100%)
    const cloudFactor = 1 - (clouds / 100);
    
    // Calculate final UV index
    let uvi = baseUVI * tempFactor * cloudFactor;
    
    // Round to nearest whole number and ensure it's between 0 and 11
    return Math.max(0, Math.min(11, Math.round(uvi)));
}

function processForecasts(forecastList, currentWeather) {
    const now = new Date();
    const currentSunset = new Date(currentWeather.sys.sunset * 1000);
    const dailyForecasts = new Map();

    // Group forecasts by day
    forecastList.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });

        if (!dailyForecasts.has(dateKey)) {
            dailyForecasts.set(dateKey, []);
        }
        dailyForecasts.get(dateKey).push(item);
    });

    const processedForecasts = [];
    
    for (const [date, items] of dailyForecasts) {
        if (processedForecasts.length >= 3) break;

        const dayStart = new Date(items[0].dt * 1000);
        dayStart.setHours(0, 0, 0, 0);

        // Skip today if after sunset
        if (dayStart.getDate() === now.getDate() &&
            dayStart.getMonth() === now.getMonth() &&
            dayStart.getFullYear() === now.getFullYear() &&
            now > currentSunset) {
            continue;
        }

        const daysSinceToday = Math.round((dayStart.getTime() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
        const baseSunrise = new Date(currentWeather.sys.sunrise * 1000);
        const baseSunset = new Date(currentWeather.sys.sunset * 1000);

        const sunriseDate = new Date(baseSunrise.getTime() + (daysSinceToday * 24 * 60 * 60 * 1000));
        const sunsetDate = new Date(baseSunset.getTime() + (daysSinceToday * 24 * 60 * 60 * 1000));

        // Process hourly forecasts
        const hourlyForecasts = [];
        let startIndex = -1;
        let maxUVI = 0;

        for (let i = 0; i < items.length; i++) {
            const itemTime = new Date(items[i].dt * 1000);
            const uvi = estimateUVIndex(items[i].main.temp, items[i].clouds.all, itemTime);
            maxUVI = Math.max(maxUVI, uvi);

            if (itemTime >= sunriseDate && startIndex === -1) {
                startIndex = i;
            }
            if (startIndex !== -1 && itemTime <= sunsetDate) {
                const score = calculateBikingScore(
                    items[i].main.temp,
                    items[i].wind.speed,
                    items[i].rain?.['3h'] || items[i].snow?.['3h'] ? 100 : 0,
                    items[i].weather[0].main
                );

                hourlyForecasts.push({
                    originalTime: itemTime,
                    time: itemTime.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        hour12: true
                    }).toLowerCase(),
                    score: score.score,
                    temperature: Math.round(items[i].main.temp),
                    windSpeed: Math.round(items[i].wind.speed * 3.6),
                    precipitation: items[i].rain?.['3h'] || items[i].snow?.['3h'] ? 100 : 0,
                    description: items[i].weather[0].description
                });
            }
        }

        // Calculate average score
        const averageScore = Math.round(
            hourlyForecasts.reduce((sum, f) => sum + f.score, 0) / hourlyForecasts.length
        );

        // Get the top 3 best hours
        const bestHours = [...hourlyForecasts]
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .sort((a, b) => {
                // Use the original Date objects for sorting
                const timeA = new Date(a.originalTime);
                const timeB = new Date(b.originalTime);
                return timeA - timeB;
            });

        processedForecasts.push({
            date,
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
            windSpeed: Math.round(items[0].wind.speed * 3.6),
            precipitation: items.some(item =>
                item.rain?.['3h'] || item.snow?.['3h'] ||
                item.weather[0].main.toLowerCase().includes('rain') ||
                item.weather[0].main.toLowerCase().includes('snow')
            ) ? 100 : 0,
            uvi: maxUVI,
            bikingScore: {
                score: averageScore,
                message: getBikingMessage(averageScore)
            },
            sunrise: sunriseDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            }).toLowerCase(),
            sunset: sunsetDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            }).toLowerCase(),
            hourlyForecasts,
            bestHours
        });
    }

    return processedForecasts;
}

function calculateBikingScore(temp, windSpeed, precipitation, weatherMain) {
    let score = 100;

    // Temperature impact (ideal range: 15-25°C)
    if (temp < 5 || temp > 35) {
        score -= 40;
    } else if (temp < 10 || temp > 30) {
        score -= 20;
    } else if (temp < 15 || temp > 25) {
        score -= 10;
    }

    // Wind impact (m/s)
    if (windSpeed > 10) {
        score -= 40;
    } else if (windSpeed > 7) {
        score -= 20;
    } else if (windSpeed > 5) {
        score -= 10;
    }

    // Precipitation impact
    if (precipitation > 0) {
        score -= 50;
    }

    // Weather condition impact
    const badWeather = ['Rain', 'Snow', 'Thunderstorm', 'Drizzle'];
    if (badWeather.includes(weatherMain)) {
        score -= 40;
    }

    return {
        score: Math.max(0, Math.min(100, score)),
        message: getBikingMessage(score)
    };
}

function getBikingMessage(score) {
    if (score >= 80) return "Perfect for cycling!";
    if (score >= 60) return "Good conditions";
    if (score >= 40) return "Moderate conditions";
    if (score >= 20) return "Poor conditions";
    return "Not recommended";
}

module.exports = {
    fetchWeatherForecast
};
