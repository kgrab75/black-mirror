'use client';

import TempInfo from '@/app/components/modules/weather/TempInfo';
import TextFit from '@/app/components/TextFit';
import weatherDescription from '@/app/lib/data/weather_code_description_fr.json';
import { DailyWeatherData, WeatherData } from '@/app/types/Weather';
import { faDroplet } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRef } from 'react';

export default function WeatherDailyInfo({
  weatherData,
  isForecast = false,
}: {
  weatherData: DailyWeatherData;
  isForecast?: boolean;
}) {
  const ref = useRef(null);
  const dataWeatherDescription: WeatherData = weatherDescription;

  const {
    weatherCode,
    time,
    feelsLikeMax,
    feelsLikeMin,
    temperatureMax,
    temperatureMin,
    precipitation,
  } = weatherData;

  const icon = `owi owi-${dataWeatherDescription[weatherCode]['day'].icon} !flex`;

  return (
    <div
      className="flex-1 box-border relative after:content-[''] after:absolute after:-right-px after:top-1/8 after:h-3/4 after:w-[1px] after:bg-white"
      ref={ref}
    >
      <div className="flex place-content-around flex-col h-full">
        <div className="text-center" ref={ref}>
          <TextFit widthFactor={0.2} heightFactor={0.1} refParent={ref}>
            {time.toLocaleDateString('fr-FR', {
              weekday: 'short',
              day: 'numeric',
            })}
          </TextFit>
        </div>

        <div className="flex justify-center items-center flex-1">
          <div className={`inline-flex w-full justify-around flex-col`}>
            <div className="weather-icon flex justify-center items-center">
              <TextFit widthFactor={0.7} heightFactor={0.4} refParent={ref}>
                <i className={icon}></i>
              </TextFit>
            </div>
            <div className="flex flex-col justify-around h-full">
              <TextFit widthFactor={0.2} heightFactor={0.11} refParent={ref}>
                <div className="temperatures flex justify-center items-center">
                  <TempInfo
                    {...{
                      feelsLikeMax,
                      feelsLikeMin,
                      temperatureMax,
                      temperatureMin,
                    }}
                  />
                </div>

                <div className="precipitation flex justify-center items-baseline">
                  {!!precipitation ? (
                    <>
                      <FontAwesomeIcon icon={faDroplet} size="xs" />
                      {precipitation.toFixed(1)}
                      <div style={{ fontSize: '0.5em' }}>mm</div>
                    </>
                  ) : isForecast ? (
                    <>&nbsp;</>
                  ) : null}
                </div>
              </TextFit>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
