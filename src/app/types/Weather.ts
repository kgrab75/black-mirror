import { WeatherDataParams } from "@atombrenner/openmeteo";

export interface WeatherDescription {
    description: string;
    icon: string;
}

export type WeatherType = 'current' | 'daily' | 'hourly' | 'temperature' | 'precipitation';

export interface Weather {
    day: WeatherDescription;
    night: WeatherDescription;
}

export interface WeatherData {
    [key: string]: Weather;
}

export interface FullWeatherData {
    time: Date;
    temperature: number;
    feelsLike: number;
    weatherCode: number;
    precipitation: number;
    isDay: boolean;
}

export interface CurrentWeatherData {
    time: Date;
    weatherCode: number;
    temperature: number;
    feelsLike: number;
    precipitation: number;
    isDay: boolean;
}

export interface HourlyWeatherData {
    time: Date;
    weatherCode: number;
    temperature: number;
    feelsLike: number;
    precipitation: number;
    isDay: boolean;
}

export interface DailyWeatherData {
    time: Date;
    weatherCode: number;
    temperatureMin: number;
    temperatureMax: number;
    feelsLikeMin: number;
    feelsLikeMax: number;
    precipitation: number;
}

export interface TemperatureWeatherData {
    temperatureMin: number;
    temperatureMax: number;
    feelsLikeMin: number;
    feelsLikeMax: number;
}

export interface PrecipitationWeatherData {
    precipitation: number;
}

export interface DailyData {
    temperatureMin: number;
    temperatureMax: number;
    feelsLikeMin: number;
    feelsLikeMax: number;
    precipitation: number;
}

export type ExtendedWeatherDataParams = WeatherDataParams & {
    granularity: number;
};