const express = require('express');
const cors = require('cors');
const path = require('path');
const { fetchWeatherForecast } = require('./services/weatherService');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API endpoint to get weather forecast
app.get('/api/forecast', async (req, res) => {
    try {
        console.log('Fetching weather forecast...');
        const forecast = await fetchWeatherForecast();
        console.log('Forecast data:', JSON.stringify(forecast, null, 2));
        res.json(forecast);
    } catch (error) {
        console.error('Error in /api/forecast:', error);
        res.status(500).json({ 
            error: 'Failed to fetch weather forecast',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Serve the main HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        details: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Environment variables loaded:', {
        OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY ? 'Set' : 'Not set'
    });
});
