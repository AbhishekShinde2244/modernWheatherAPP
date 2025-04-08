# Modern Weather App

A modern, responsive weather application built with React, TypeScript, and Material-UI. This app displays weather information based on your current location or a searched city, and includes features like speed detection and transportation mode identification.

## Features

- **Weather Information**: Display current temperature, humidity, wind speed, and weather conditions
- **Location Search**: Search for weather by city name
- **Current Location**: Get weather for your current location with one click
- **Speed Detection**: Uses GPS to detect your current speed (best on mobile devices)
- **Transportation Mode**: Automatically identifies your mode of transportation based on speed
- **Interactive Map**: Shows your location on an OpenStreetMap
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, intuitive interface with Material-UI components

## Technologies Used

- React
- TypeScript
- Material-UI
- Vite
- Axios
- OpenStreetMap
- WeatherAPI.com

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/AbhishekShinde2244/modernWheatherAPP.git
   ```

2. Navigate to the project directory:
   ```
   cd modernWheatherAPP
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## API Key

This app uses the WeatherAPI.com API. You'll need to replace the API key in `src/App.tsx` with your own:

```typescript
const API_KEY = 'YOUR_API_KEY';
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Weather data provided by [WeatherAPI.com](https://www.weatherapi.com/)
- Maps provided by [OpenStreetMap](https://www.openstreetmap.org/)
- Icons from [Material-UI Icons](https://mui.com/material-ui/material-icons/) 