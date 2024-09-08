import OpenWeatherAPI from "openweather-api-node";

const language = process.env.LOCALE_2_LETTER || 'fr';

export const openWeatherAPI = new OpenWeatherAPI({
  key: process.env.NEXT_PUBLIC_OPEN_WEATHER_API_KEY,
  units: 'metric',
  lang: language as 'fr',
});