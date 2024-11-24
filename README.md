# Best Biking Day 🚲

A React Native web application that helps cyclists find the best days for biking by providing detailed weather forecasts with cycling-specific condition scores.

## Features 🌟

- 3-Day Weather Forecast with cycling-specific scores
- Detailed weather conditions (temperature, wind, humidity, precipitation)
- Color-coded scoring system for biking conditions
- Responsive design that works across all devices
- Dark theme with modern UI

## Prerequisites 📋

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (v9 or higher)
- [Git](https://git-scm.com/)

## Environment Setup 🔧

1. Clone the repository:
```bash
git clone https://github.com/yourusername/BestBikingDay.git
cd BestBikingDay
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
OPENWEATHER_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with your OpenWeatherMap API key. You can get one at [OpenWeatherMap](https://openweathermap.org/api).

## Development 💻

To start the development server:

```bash
npm start
```

This will start the Expo development server. You can then:
- Press `w` to open in web browser
- Use the Expo Go app on your mobile device to scan the QR code
- Press `a` to open in Android emulator
- Press `i` to open in iOS simulator

## Building for Production 🏗️

### Web Build

1. Create a production build:
```bash
npm run build:web
```

This will create a production-ready build in the `web-build` directory.

### Mobile Build

For mobile builds, you'll need an [Expo](https://expo.dev/) account.

1. Install Expo CLI globally:
```bash
npm install -g expo-cli
```

2. Build for Android:
```bash
expo build:android
```

3. Build for iOS:
```bash
expo build:ios
```

## Deploying to Netlify 🚀

1. Create a new site on [Netlify](https://www.netlify.com/)

2. Configure build settings:
   - Build command: `npm run build:web`
   - Publish directory: `dist`
   - Node version: 18 (or your preferred version)

3. Add environment variables:
   - Go to Site settings > Build & deploy > Environment
   - Add `OPENWEATHER_API_KEY` with your API key

4. Deploy methods:

   ### Option 1: Continuous Deployment (Recommended)
   
   1. Connect your GitHub repository to Netlify
   2. Configure automatic deployments
   3. Push changes to your repository to trigger builds

   ### Option 2: Manual Deployment
   
   1. Build locally:
   ```bash
   npm run build:web
   ```
   
   2. Drag and drop the `dist` folder to Netlify's UI
   
   ### Option 3: Netlify CLI
   
   1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```
   
   2. Login to Netlify:
   ```bash
   netlify login
   ```
   
   3. Deploy:
   ```bash
   netlify deploy --dir dist--prod
   ```

## Project Structure 📁

```
BestBikingDay/
├── app/                   # Main application code
│   ├── services/         # API and business logic
│   └── index.tsx         # Main screen
├── components/           # Reusable components
├── assets/              # Static assets
├── .env                 # Environment variables
└── package.json         # Dependencies and scripts
```

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 🙏

- Weather data provided by [OpenWeatherMap](https://openweathermap.org/)
- Built with [React Native](https://reactnative.dev/) and [Expo](https://expo.dev/)
- Deployed with [Netlify](https://www.netlify.com/)
