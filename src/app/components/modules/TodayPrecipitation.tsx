'use client';

import Loader from '@/app/components/Loader';
import TextFit from '@/app/components/TextFit';
import useWeather from '@/app/hooks/useWeather';
import useWeatherLocation from '@/app/hooks/useWeatherLocation';
import { ModuleProps } from '@/app/lib/definitions';
import { WeatherDataParams } from '@atombrenner/openmeteo';
import {
  faDroplet,
  faSlash,
  faUmbrella,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRef, useState } from 'react';
import { useSpeechRecognition } from 'react-speech-recognition';

export default function TodayPrecipitation(props: ModuleProps) {
  const ref = useRef(null);
  const { weatherLocation, error } = useWeatherLocation();
  const [displayPrecipitation, setdisplayPrecipitation] = useState(false);

  useSpeechRecognition({
    commands: [
      {
        command: [
          `Affiche la précipitation`,
          `Affiche les précipitations`,
          `Affiche la pluie`,
        ],
        callback: () => setdisplayPrecipitation(true),
      },
      {
        command: [
          `Cache la précipitation`,
          `Cache les précipitations`,
          `Cache la pluie`,
        ],
        callback: () => setdisplayPrecipitation(false),
      },
    ],
  });

  const params = {
    latitude: weatherLocation.lat,
    longitude: weatherLocation.lon,
    daily: ['precipitation_sum'],
    timezone: 'Europe/Paris',
    models: 'meteofrance_seamless',
  } as WeatherDataParams;

  const { loading, precipitationWeatherDatas } = useWeather(
    weatherLocation,
    params,
    'precipitation',
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="px-2 h-full">
      {error ? (
        <div>{error}</div>
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          ref={ref}
        >
          <TextFit
            widthFactor={displayPrecipitation ? 0.25 : 0.35}
            heightFactor={displayPrecipitation ? 0.2 : 0.35}
            refParent={ref}
          >
            <div className="temperatures flex justify-center items-center flex-col h-[inherit]">
              <FontAwesomeIcon
                icon={faUmbrella}
                size="2x"
                className={
                  !precipitationWeatherDatas.precipitation ? 'opacity-70' : ''
                }
              />
              {!precipitationWeatherDatas.precipitation && (
                <FontAwesomeIcon
                  icon={faSlash}
                  size="2x"
                  className="absolute"
                  transform={displayPrecipitation ? { y: -6 } : {}}
                />
              )}
              {displayPrecipitation && (
                <div className="inline-flex items-baseline">
                  <FontAwesomeIcon icon={faDroplet} size="xs" />
                  {precipitationWeatherDatas.precipitation.toFixed(1)}
                  <div style={{ fontSize: '0.5em' }}>mm</div>
                </div>
              )}
            </div>
          </TextFit>
        </div>
      )}
    </div>
  );
}
