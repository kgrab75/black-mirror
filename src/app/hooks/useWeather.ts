'use client';

import { useState, useEffect } from 'react';
import { fetchWeatherData, WeatherDataParams } from '@atombrenner/openmeteo';
import {
  WeatherType, DailyWeatherData, CurrentWeatherData, HourlyWeatherData,
  PrecipitationWeatherData, TemperatureWeatherData, ExtendedWeatherDataParams
} from '@/app/types/Weather';

export default function useWeather(location: { name: string; lat: number; lon: number }, params: WeatherDataParams | ExtendedWeatherDataParams, weatherType: WeatherType) {
  const [currentWeatherDatas, setCurrentWeatherDatas] = useState<CurrentWeatherData[]>([]);
  const [hourlyWeatherDatas, setHourlyWeatherDatas] = useState<HourlyWeatherData[]>([]);
  const [dailyWeatherDatas, setDailyWeatherDatas] = useState<DailyWeatherData[]>([]);
  const [temperatureWeatherDatas, setTemperatureWeatherDatas] = useState<TemperatureWeatherData>({ feelsLikeMax: 0, feelsLikeMin: 0, temperatureMax: 0, temperatureMin: 0 });
  const [precipitationWeatherDatas, setPrecipitationWeatherDatas] = useState<PrecipitationWeatherData>({ precipitation: 0 });
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const callOpenWeatherAPI = async () => {
      try {
        const data = await fetchWeatherData(params);

        switch (weatherType) {
          case 'current':
            setCurrentWeatherDatas([{
              temperature: data.current.temperature_2m,
              feelsLike: data.current.apparent_temperature,
              weatherCode: data.current.weather_code,
              isDay: Boolean(data.current.is_day),
              precipitation: data.current.precipitation,
              time: new Date(data.current.time * 1000),
            }]);
            break;
          case 'hourly':
            setHourlyWeatherDatas(
              data.hourly.time.reduce<HourlyWeatherData[]>((acc, time, index) => {
                if ((index - 1) % ('granularity' in params ? params.granularity : 0) === 0) {
                  acc.push({
                    time: new Date(time * 1000),
                    temperature: data.hourly.temperature_2m[index],
                    feelsLike: data.hourly.apparent_temperature[index],
                    weatherCode: data.hourly.weather_code[index],
                    precipitation: data.hourly.precipitation[index],
                    isDay: Boolean(data.hourly.is_day[index]),
                  });
                }
                return acc;
              }, [])
            );
            break;
          case 'daily':
            setDailyWeatherDatas(
              data.daily.time.reduce<DailyWeatherData[]>((acc, time, index) => {
                acc.push({
                  time: new Date(time * 1000),
                  temperatureMin: data.daily.temperature_2m_min[index],
                  temperatureMax: data.daily.temperature_2m_max[index],
                  weatherCode: data.daily.weather_code[index],
                  feelsLikeMin: data.daily.apparent_temperature_min[index],
                  feelsLikeMax: data.daily.apparent_temperature_max[index],
                  precipitation: data.daily.precipitation_sum[index],

                });
                return acc;
              }, [])
            );
            break;
          case 'precipitation':
            setPrecipitationWeatherDatas({
              precipitation: params.daily?.includes('precipitation_sum') ? data.daily.precipitation_sum[0] : 0
            });
            break;
          case 'temperature':
            setTemperatureWeatherDatas({
              temperatureMin: params.daily?.includes('temperature_2m_min') ? data.daily.temperature_2m_min[0] : 0,
              temperatureMax: params.daily?.includes('temperature_2m_max') ? data.daily.temperature_2m_max[0] : 0,
              feelsLikeMin: params.daily?.includes('apparent_temperature_min') ? data.daily.apparent_temperature_min[0] : 0,
              feelsLikeMax: params.daily?.includes('apparent_temperature_max') ? data.daily.apparent_temperature_max[0] : 0,
            });
            break;
          default:
            console.log(`Sorry, we are out of ${weatherType}.`);
        }


        setLoading(false);
      } catch (error) {
        console.error('Error calling the OpenWeatherAPI:', error);
      }
    };

    const getNextInterval = () => {
      const now = new Date();
      const minutes = now.getMinutes();
      const nextMinuteMark = Math.ceil((minutes + 1) / 20) * 20; // Next 20-minute mark
      const nextTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours(),
        nextMinuteMark,
        0,
        0
      );
      return nextTime.getTime() - now.getTime();
    };

    const scheduleNextCall = () => {
      const timeout = getNextInterval();
      return setTimeout(() => {
        callOpenWeatherAPI();
        scheduleNextCall(); // Schedule the next call after the current one completes
      }, timeout);
    };

    callOpenWeatherAPI();
    const timeoutId = scheduleNextCall();

    return () => {
      clearTimeout(timeoutId); // Cleanup timeout on component unmount
    };
  }, [location]);

  return {
    currentWeatherDatas,
    hourlyWeatherDatas,
    dailyWeatherDatas,
    temperatureWeatherDatas,
    precipitationWeatherDatas,
    loading
  };
}
