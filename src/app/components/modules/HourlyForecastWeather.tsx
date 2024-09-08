'use client';

import Loader from '@/app/components/Loader';
import WeatherInfo from '@/app/components/modules/weather/WeatherInfo';
import useWeather from '@/app/hooks/useWeather';
import useWeatherLocation from '@/app/hooks/useWeatherLocation';
import { ModuleProps } from '@/app/lib/definitions';
import { ExtendedWeatherDataParams } from '@/app/types/Weather';
import { useState } from 'react';

export default function HourlyForecastWeather(props: ModuleProps) {
  const { weatherLocation, error } = useWeatherLocation();
  const [granularity, setGranularity] = useState(2);

  const params = {
    latitude: weatherLocation.lat,
    longitude: weatherLocation.lon,
    forecast_days: 1,
    forecast_hours: Math.floor((props.width / 2) * granularity),
    hourly: [
      'temperature_2m',
      'apparent_temperature',
      'weather_code',
      'is_day',
      'precipitation',
    ],
    timezone: 'Europe/Paris',
    models: 'meteofrance_seamless',
    granularity,
  } as ExtendedWeatherDataParams;

  const { loading, hourlyWeatherDatas } = useWeather(
    weatherLocation,
    params,
    'hourly'
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="h-full">
      {error ? (
        <div>{error}</div>
      ) : (
        <div className="flex h-full">
          {hourlyWeatherDatas.map((hourlyWeatherData) => (
            <WeatherInfo
              key={hourlyWeatherData.time.getHours()}
              isForecast={true}
              weatherData={hourlyWeatherData}
            />
          ))}
        </div>
      )}
    </div>
  );
}
