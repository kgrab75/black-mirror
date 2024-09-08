import { useContext } from 'react';
import { WeatherLocationContext } from '@/app/components/context/WeatherLocationContext';

export default function useWeatherLocationContext() {
  const object = useContext(WeatherLocationContext);
  if (!object) { throw new Error("useGetComplexObject must be used within a Provider") }
  return object;
}