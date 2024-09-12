'use client';

import Loader from '@/app/components/Loader';
import TempInfo from '@/app/components/modules/weather/TempInfo';
import TextFit from '@/app/components/TextFit';
import useWeather from '@/app/hooks/useWeather';
import useWeatherLocation from '@/app/hooks/useWeatherLocation';
import { ModuleProps } from '@/app/lib/definitions';
import { WeatherDataParams } from '@atombrenner/openmeteo';
import { useRef } from 'react';

export default function TodayTemp(props: ModuleProps) {
  const ref = useRef(null);
  const { weatherLocation, error } = useWeatherLocation();

  const params = {
    latitude: weatherLocation.lat,
    longitude: weatherLocation.lon,
    daily: [
      'temperature_2m_min',
      'apparent_temperature_min',
      'temperature_2m_max',
      'apparent_temperature_max',
    ],
    timezone: 'Europe/Paris',
    models: 'meteofrance_seamless',
  } as WeatherDataParams;

  const { loading, temperatureWeatherDatas } = useWeather(
    weatherLocation,
    params,
    'temperature'
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="px-2 h-full flex justify-center" ref={ref}>
      {error ? (
        <div>{error}</div>
      ) : (
        <TextFit widthFactor={0.25} heightFactor={0.4} refParent={ref}>
          <TempInfo {...temperatureWeatherDatas} />
        </TextFit>
      )}
    </div>
  );
}
