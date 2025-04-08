import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Paper,
  useTheme,
  Grid,
  Chip,
  AppBar,
  Toolbar,
  Fade
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Thermostat as ThermostatIcon,
  WaterDrop as WaterDropIcon,
  Air as AirIcon,
  Visibility as VisibilityIcon,
  Speed as SpeedIcon,
  DirectionsWalk as WalkIcon,
  DirectionsBike as BikeIcon,
  DirectionsCar as CarIcon,
  DirectionsBus as BusIcon,
  Train as TrainIcon,
  WbSunny as SunnyIcon
} from '@mui/icons-material';

interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    localtime: string;
    lat: number;
    lon: number;
  };
  current: {
    temp_c: number;
    feelslike_c: number;
    humidity: number;
    wind_kph: number;
    condition: {
      text: string;
      icon: string;
    };
  };
}

// Transportation mode based on speed
interface TransportationMode {
  mode: 'walking' | 'cycling' | 'driving' | 'bus' | 'train' | 'unknown';
  icon: JSX.Element;
  label: string;
  speedRange: string;
}

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [speed, setSpeed] = useState<number | null>(null);
  const [transportationMode, setTransportationMode] = useState<TransportationMode | null>(null);
  const theme = useTheme();

  const API_KEY = '674a41e61b0444d5be6101001250804';

  // Determine transportation mode based on speed
  const getTransportationMode = (speedKmh: number): TransportationMode => {
    if (speedKmh < 5) {
      return {
        mode: 'walking',
        icon: <WalkIcon />,
        label: 'Walking',
        speedRange: '0-5 km/h'
      };
    } else if (speedKmh < 25) {
      return {
        mode: 'cycling',
        icon: <BikeIcon />,
        label: 'Cycling',
        speedRange: '5-25 km/h'
      };
    } else if (speedKmh < 60) {
      return {
        mode: 'driving',
        icon: <CarIcon />,
        label: 'Driving',
        speedRange: '25-60 km/h'
      };
    } else if (speedKmh < 100) {
      return {
        mode: 'bus',
        icon: <BusIcon />,
        label: 'Bus',
        speedRange: '60-100 km/h'
      };
    } else {
      return {
        mode: 'train',
        icon: <TrainIcon />,
        label: 'Train',
        speedRange: '100+ km/h'
      };
    }
  };

  const getWeather = async (cityName: string) => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(
        `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${cityName}&aqi=no`
      );
      setWeather(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError('Invalid API key. Please check your WeatherAPI key.');
        } else if (err.response?.status === 404) {
          setError('City not found. Please try again.');
        } else {
          setError(`Error: ${err.response?.data?.error?.message || err.message}`);
        }
      } else {
        setError('An unexpected error occurred.');
      }
      setWeather(null);
      console.error('Weather API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            setLoading(true);
            setError('');
            
            // Get speed if available
            if (position.coords.speed !== null && position.coords.speed !== undefined) {
              // Convert m/s to km/h
              const speedKmh = position.coords.speed * 3.6;
              setSpeed(speedKmh);
              setTransportationMode(getTransportationMode(speedKmh));
            } else {
              // If speed is not available, assume stationary
              setSpeed(0);
              setTransportationMode({
                mode: 'walking',
                icon: <WalkIcon />,
                label: 'Stationary',
                speedRange: '0 km/h'
              });
            }
            
            const response = await axios.get(
              `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${position.coords.latitude},${position.coords.longitude}&aqi=no`
            );
            setWeather(response.data);
            setCity(response.data.location.name);
          } catch (err) {
            if (axios.isAxiosError(err)) {
              if (err.response?.status === 401) {
                setError('Invalid API key. Please check your WeatherAPI key.');
              } else {
                setError(`Error: ${err.response?.data?.error?.message || err.message}`);
              }
            } else {
              setError('An unexpected error occurred.');
            }
            setWeather(null);
            console.error('Weather API Error:', err);
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          setError('Error getting location. Please enable location services.');
          setWeather(null);
        },
        { enableHighAccuracy: true } // Request high accuracy to get speed
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      getWeather(city);
    }
  };

  // Determine background gradient based on weather condition
  const getBackgroundStyle = () => {
    if (!weather) return { background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)' };
    
    const condition = weather.current.condition.text.toLowerCase();
    
    if (condition.includes('sunny') || condition.includes('clear')) {
      return { background: 'linear-gradient(135deg, #ff9a44 0%, #fc6076 100%)' };
    } else if (condition.includes('rain') || condition.includes('drizzle')) {
      return { background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' };
    } else if (condition.includes('cloud') || condition.includes('overcast')) {
      return { background: 'linear-gradient(135deg, #606c88 0%, #3f4c6b 100%)' };
    } else if (condition.includes('snow')) {
      return { background: 'linear-gradient(135deg, #e6dada 0%, #274046 100%)' };
    } else if (condition.includes('thunder') || condition.includes('storm')) {
      return { background: 'linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)' };
    } else {
      return { background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)' };
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        ...getBackgroundStyle(),
        transition: 'background 1s ease-in-out',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <AppBar position="static" sx={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(10px)' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Weather App
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="md" sx={{ flexGrow: 1, py: 4 }}>
        <Box sx={{ 
          my: 4, 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              borderRadius: 4, 
              width: '100%', 
              maxWidth: 600,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              mb: 4
            }}
          >
            <form onSubmit={handleSearch}>
              <Box sx={{ 
                display: 'flex', 
                gap: 1, 
                mb: 2,
                position: 'relative'
              }}>
                <TextField
                  fullWidth
                  placeholder="Enter city name"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'white',
                        boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                      }
                    }
                  }}
                />
                <Button 
                  variant="contained" 
                  type="submit"
                  disabled={loading}
                  sx={{ 
                    borderRadius: 3,
                    minWidth: 'auto',
                    px: 3,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                  }}
                >
                  <SearchIcon />
                </Button>
              </Box>
            </form>

            <Button 
              variant="outlined" 
              onClick={getCurrentLocation}
              disabled={loading}
              startIcon={<LocationIcon />}
              sx={{ 
                borderRadius: 3,
                borderColor: 'rgba(255, 255, 255, 0.5)',
                color: theme.palette.primary.main,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                }
              }}
            >
              Current Location
            </Button>
          </Paper>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress sx={{ color: 'white' }} />
            </Box>
          )}
          
          {error && (
            <Paper 
              elevation={3} 
              sx={{ 
                p: 2, 
                borderRadius: 3, 
                backgroundColor: 'rgba(244, 67, 54, 0.9)',
                color: 'white',
                maxWidth: 600,
                width: '100%',
                mb: 4
              }}
            >
              <Typography>{error}</Typography>
            </Paper>
          )}

          {weather && (
            <Fade in={true} timeout={1000}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      height: '100%', 
                      borderRadius: 4,
                      overflow: 'hidden',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <Box 
                      sx={{ 
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        height: '100%'
                      }}
                    >
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          mb: 2,
                          position: 'relative'
                        }}
                      >
                        <img 
                          src={weather.current.condition.icon} 
                          alt={weather.current.condition.text}
                          style={{ 
                            width: '120px', 
                            height: '120px',
                            filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))'
                          }}
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body1">
                          {weather.location.name}, {weather.location.country}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <ThermostatIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body1">
                          {weather.current.temp_c}°C
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <WaterDropIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body1">
                          Humidity: {weather.current.humidity}%
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AirIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body1">
                          Wind: {weather.current.wind_kph} km/h
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <VisibilityIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body1">
                          {weather.current.condition.text}
                        </Typography>
                      </Box>
                      
                      {/* Speed and Transportation Mode */}
                      {speed !== null && transportationMode && (
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center',
                            mb: 3,
                            p: 2,
                            borderRadius: 3,
                            backgroundColor: 'rgba(0, 0, 0, 0.05)',
                            width: '100%'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <SpeedIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h6" component="div">
                              {speed.toFixed(1)} km/h
                            </Typography>
                          </Box>
                          
                          <Chip
                            icon={transportationMode.icon}
                            label={`${transportationMode.label} (${transportationMode.speedRange})`}
                            color="primary"
                            sx={{ 
                              mt: 1,
                              fontWeight: 'bold',
                              '& .MuiChip-icon': {
                                color: 'inherit'
                              }
                            }}
                          />
                        </Box>
                      )}
                      
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-around', 
                        width: '100%',
                        mt: 'auto',
                        pt: 2,
                        borderTop: '1px solid rgba(0, 0, 0, 0.1)'
                      }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <WaterDropIcon sx={{ color: 'primary.main', mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">Humidity</Typography>
                          <Typography variant="body1" fontWeight="bold">{weather.current.humidity}%</Typography>
                        </Box>
                        
                        <Box sx={{ textAlign: 'center' }}>
                          <AirIcon sx={{ color: 'primary.main', mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">Wind</Typography>
                          <Typography variant="body1" fontWeight="bold">{weather.current.wind_kph} km/h</Typography>
                        </Box>
                        
                        <Box sx={{ textAlign: 'center' }}>
                          <SunnyIcon sx={{ color: 'primary.main', mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">Condition</Typography>
                          <Typography variant="body1" fontWeight="bold">{weather.current.condition.text}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      height: '100%', 
                      borderRadius: 4,
                      overflow: 'hidden',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <Box sx={{ p: 2 }}>
                      <iframe
                        title="location-map"
                        width="100%"
                        height="400"
                        frameBorder="0"
                        style={{ 
                          border: 0,
                          borderRadius: '8px',
                          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                        }}
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${weather.location.lon-0.1}%2C${weather.location.lat-0.1}%2C${weather.location.lon+0.1}%2C${weather.location.lat+0.1}&layer=mapnik&marker=${weather.location.lat}%2C${weather.location.lon}`}
                        allowFullScreen
                      />
                      <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Button 
                          variant="text" 
                          href={`https://www.openstreetmap.org/?mlat=${weather.location.lat}&mlon=${weather.location.lon}&zoom=10`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ 
                            borderRadius: 3,
                            textTransform: 'none'
                          }}
                        >
                          View Larger Map
                        </Button>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Fade>
          )}
        </Box>
      </Container>
    </Box>
  );
}

export default App; 