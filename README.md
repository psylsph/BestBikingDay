# Best Biking Day

A React Native mobile application that helps cyclists plan their rides by providing detailed weather forecasts with cycling-specific scores.

## Features

- 5-day weather forecast
- Cycling condition scores (0-100)
- Detailed weather information including temperature, wind, and precipitation
- Dark theme with color-coded weather cards
- Smart filtering (hides today's forecast after 6 PM)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/best-biking-day.git
cd best-biking-day
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your OpenWeatherMap API key:
```
OPENWEATHER_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm start
```

## Building for Production

### Web
```bash
npx expo export

```



## Publishing

1. Create an Expo account at https://expo.dev/signup

2. Login to Netlify:
```bash
npx netlify deploy --dir dist
```

3. Configure your app in app.json:
- Update the "owner" field
- Set your bundle identifier/package name
- Configure your splash screen and icons

4. Build and submit:
```bash
eas build --platform all
eas submit --platform ios
eas submit --platform android
```

## Development

- Built with React Native and Expo
- TypeScript for type safety
- OpenWeatherMap API for weather data
- Custom scoring algorithm for cycling conditions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenWeatherMap API for weather data
- Expo team for the amazing development platform
- React Native community for the robust ecosystem
