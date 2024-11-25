async function fetchWeatherData() {
    try {
        const response = await fetch('/api/forecast');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
}

function getScoreClass(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    if (score >= 20) return 'poor';
    return 'bad';
}

function getUVIClass(uvi) {
    if (uvi <= 2) return 'uv-low';
    if (uvi <= 5) return 'uv-moderate';
    if (uvi <= 7) return 'uv-high';
    if (uvi <= 10) return 'uv-very-high';
    return 'uv-extreme';
}

function createHourlyDetails(forecast) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    const closeButton = document.createElement('span');
    closeButton.className = 'close-button';
    closeButton.innerHTML = '&times;';
    closeButton.onclick = () => {
        modal.style.display = 'none';
        document.body.removeChild(modal);
    };
    
    const title = document.createElement('h2');
    title.textContent = `Forecast for ${forecast.date}`;
    
    const hourlyList = document.createElement('div');
    hourlyList.className = 'hourly-list';
    
    forecast.hourlyForecasts.forEach(hour => {
        const hourItem = document.createElement('div');
        hourItem.className = 'hourly-item';
        
        hourItem.innerHTML = `
            <span class="hour-time">${hour.time}</span>
            <span class="hour-temp">${hour.temperature}°C</span>
            <span class="hour-score ${getScoreClass(hour.score)}">${hour.score}</span>
            <span class="hour-desc">${hour.description}</span>
        `;
        
        hourlyList.appendChild(hourItem);
    });
    
    modalContent.appendChild(closeButton);
    modalContent.appendChild(title);
    modalContent.appendChild(hourlyList);
    modal.appendChild(modalContent);
    
    return modal;
}

function createForecastCard(forecast) {
    const card = document.createElement('div');
    card.className = 'forecast-card';

    // Left section with date and basic weather info
    const leftSection = document.createElement('div');
    leftSection.className = 'forecast-left';

    const dateSection = document.createElement('div');
    dateSection.className = 'forecast-date';
    dateSection.textContent = forecast.date;

    const sunTimes = document.createElement('div');
    sunTimes.className = 'sun-times';
    sunTimes.innerHTML = `
        <div class="sun-time">
            <span class="sun-icon">☀️</span>
            <span class="time">${forecast.sunrise}</span>
        </div>
        <div class="sun-time">
            <span class="sun-icon">🌙</span>
            <span class="time">${forecast.sunset}</span>
        </div>
    `;

    const weatherInfo = document.createElement('div');
    weatherInfo.className = 'weather-info';
    weatherInfo.innerHTML = `
        <img src="https://openweathermap.org/img/wn/${forecast.weather.icon}.png" alt="${forecast.weather.description}">
        <span class="weather-desc">${forecast.weather.description}</span>
    `;

    leftSection.appendChild(dateSection);
    leftSection.appendChild(sunTimes);
    leftSection.appendChild(weatherInfo);

    // Middle section with score
    const scoreSection = document.createElement('div');
    scoreSection.className = 'score-section';

    const scoreWheel = document.createElement('div');
    scoreWheel.className = `score-wheel ${getScoreClass(forecast.bikingScore.score)}`;
    scoreWheel.innerHTML = `
        <span class="score-number">${forecast.bikingScore.score}</span>
    `;

    const bestHours = document.createElement('div');
    bestHours.className = 'best-hours';
    
    forecast.bestHours.forEach(hour => {
        const hourItem = document.createElement('div');
        hourItem.className = 'best-hour';
        
        const container = document.createElement('div');
        container.className = 'hour-container';
        
        const timeText = document.createElement('span');
        timeText.className = 'best-hour-time';
        timeText.textContent = hour.time;
        
        const scoreBox = document.createElement('div');
        scoreBox.className = `score-box ${getScoreClass(hour.score)}`;
        scoreBox.textContent = hour.score;
        
        container.appendChild(timeText);
        container.appendChild(scoreBox);
        hourItem.appendChild(container);
        bestHours.appendChild(hourItem);
    });

    scoreSection.appendChild(scoreWheel);
    scoreSection.appendChild(bestHours);

    // Right section with weather details
    const detailsSection = document.createElement('div');
    detailsSection.className = 'details-section';
    detailsSection.innerHTML = `
        <div class="detail-row">
            <span class="detail-icon">🌡️</span>
            <div class="temp-group">
                <span class="detail-value">${forecast.temp.day}°</span>
                <span class="detail-range">(${forecast.temp.min}°–${forecast.temp.max}°)</span>
            </div>
        </div>
        <div class="detail-row">
            <span class="detail-icon">☀️</span>
            <span class="detail-value ${getUVIClass(forecast.uvi)}">${forecast.uvi}</span>
            <span class="detail-unit">UV</span>
        </div>
        <div class="detail-row">
            <span class="detail-icon">💨</span>
            <span class="detail-value">${forecast.windSpeed}</span>
            <span class="detail-unit">km/h</span>
        </div>
        <div class="detail-row">
            <span class="detail-icon">🌧️</span>
            <span class="detail-value">${forecast.precipitation}</span>
            <span class="detail-unit">%</span>
        </div>
    `;

    // Make the card clickable
    card.style.cursor = 'pointer';
    card.onclick = () => {
        const modal = createHourlyDetails(forecast);
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        // Close modal when clicking outside
        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
                document.body.removeChild(modal);
            }
        };
    };

    card.appendChild(leftSection);
    card.appendChild(scoreSection);
    card.appendChild(detailsSection);

    return card;
}

async function initializeApp() {
    try {
        const data = await fetchWeatherData();
        
        // Set location
        document.getElementById('location').textContent = data.location;

        // Create forecast cards
        const forecastsContainer = document.getElementById('forecasts');
        data.forecasts.forEach(forecast => {
            forecastsContainer.appendChild(createForecastCard(forecast));
        });
    } catch (error) {
        console.error('Error initializing app:', error);
        document.getElementById('forecasts').innerHTML = `
            <div class="error-message">
                Failed to load weather data. Please try again later.
            </div>
        `;
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', initializeApp);
