'use client';

import WeatherCityForm from '@/app/components/modules/weather/WeatherCityForm';
import useWeatherLocation from '@/app/hooks/useWeatherLocation';
import { WeatherLocationProps } from '@/app/lib/definitions';

export default function WeatherLocation(props: WeatherLocationProps) {
  const { weatherLocation, setWeatherLocation, setError } =
    useWeatherLocation();

  return (
    <WeatherCityForm
      id={props.id}
      weatherLocation={weatherLocation}
      setWeatherLocation={setWeatherLocation}
      setError={setError}
    />
  );
}
