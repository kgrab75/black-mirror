import Loader from '@/app/components/Loader';
import WeatherInfo from '@/app/components/modules/weather/WeatherInfo';
import useWeather from '@/app/hooks/useWeather';
import useWeatherLocation from '@/app/hooks/useWeatherLocation';
import { ModuleProps } from '@/app/lib/definitions';
import { WeatherDataParams } from '@atombrenner/openmeteo';

export default function CurrentWeather(props: ModuleProps) {
  const { weatherLocation, error } = useWeatherLocation();

  const params = {
    latitude: weatherLocation.lat,
    longitude: weatherLocation.lon,
    current: [
      'temperature_2m',
      'apparent_temperature',
      'weather_code',
      'is_day',
      'precipitation',
    ],
    timezone: 'Europe/Paris',
    models: 'meteofrance_seamless',
  } as WeatherDataParams;

  const { loading, currentWeatherDatas } = useWeather(
    weatherLocation,
    params,
    'current'
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
          {currentWeatherDatas.map((currentWeatherData) => (
            <WeatherInfo
              key={currentWeatherData.time.getHours()}
              weatherData={currentWeatherData}
            />
          ))}
        </div>
      )}
    </div>
  );
}
