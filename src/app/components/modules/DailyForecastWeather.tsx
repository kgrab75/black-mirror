import Loader from '@/app/components/Loader';
import WeatherDailyInfo from '@/app/components/modules/weather/WeatherDailyInfo';
import useWeather from '@/app/hooks/useWeather';
import useWeatherLocation from '@/app/hooks/useWeatherLocation';
import { ModuleProps } from '@/app/lib/definitions';
import { WeatherDataParams } from '@atombrenner/openmeteo';

export default function DailyForecastWeather(props: ModuleProps) {
  const { weatherLocation, error } = useWeatherLocation();

  const params = {
    latitude: weatherLocation.lat,
    longitude: weatherLocation.lon,
    forecast_days: Math.floor(props.width / 2),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'precipitation_sum',
    ],
    timezone: 'Europe/Paris',
    //models: 'meteofrance_seamless',
  } as WeatherDataParams;

  const { loading, dailyWeatherDatas } = useWeather(
    weatherLocation,
    params,
    'daily'
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
          {dailyWeatherDatas.map((dailyWeatherData) => (
            <WeatherDailyInfo
              key={dailyWeatherData.time.getDate()}
              isForecast={true}
              weatherData={dailyWeatherData}
            />
          ))}
        </div>
      )}
    </div>
  );
}
