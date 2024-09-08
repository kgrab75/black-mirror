'use client';

import { WeatherLocation } from '@/app/lib/definitions';
import React, {
  ReactNode,
  SetStateAction,
  createContext,
  useState,
} from 'react';

type WeatherLocationContextType = {
  weatherLocation: WeatherLocation;
  setWeatherLocation: React.Dispatch<SetStateAction<WeatherLocation>>;
  error: string;
  setError: React.Dispatch<SetStateAction<string>>;
};

export const initialWeatherLocation = {
  name: process.env.NEXT_PUBLIC_DEFAULT_WEATHER_LOCATION_NAME,
  lat: Number(process.env.NEXT_PUBLIC_DEFAULT_WEATHER_LOCATION_LAT),
  lon: Number(process.env.NEXT_PUBLIC_DEFAULT_WEATHER_LOCATION_LON),
} as WeatherLocation;

export const WeatherLocationContext = createContext<WeatherLocationContextType>(
  {
    weatherLocation: initialWeatherLocation,
    setWeatherLocation: () => {},
    error: '',
    setError: () => {},
  }
);

interface WeatherLocationProviderProps {
  children: ReactNode;
  initialWeatherLocation: WeatherLocation;
}

function WeatherLocationProvider({
  children,
  initialWeatherLocation,
}: WeatherLocationProviderProps) {
  const [weatherLocation, setWeatherLocation] = useState(
    initialWeatherLocation
  );
  const [error, setError] = useState('');

  const value = {
    weatherLocation,
    setWeatherLocation,
    error,
    setError,
  };

  return (
    <WeatherLocationContext.Provider value={value}>
      {children}
    </WeatherLocationContext.Provider>
  );
}

export default WeatherLocationProvider;
