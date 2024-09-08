import {
  faTemperatureDown,
  faTemperatureUp,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { useSpeechRecognition } from 'react-speech-recognition';

export default function TempInfo({
  feelsLikeMin,
  feelsLikeMax,
  temperatureMin,
  temperatureMax,
}: {
  feelsLikeMin: number;
  feelsLikeMax: number;
  temperatureMin: number;
  temperatureMax: number;
}) {
  const [displayFeelsLike, setdisplayFeelsLike] = useState(false);

  useSpeechRecognition({
    commands: [
      {
        command: [
          `Affiche la température ressentie`,
          `Affiche les températures ressenties`,
          `température ressentie`,
        ],
        callback: () => setdisplayFeelsLike(true),
      },
      {
        command: [
          `Affiche la température réelle`,
          `Affiche les températures réelles`,
          `température réelle`,
        ],
        callback: () => setdisplayFeelsLike(false),
      },
    ],
  });
  return (
    <div className="w-full h-full flex items-center justify-center flex-col">
      <div className="temperatures flex justify-center items-center text-cyan-200 leading-tight">
        <FontAwesomeIcon icon={faTemperatureDown} size="sm" />
        {displayFeelsLike ? (
          <div className="inline-block">
            <FontAwesomeIcon icon={faUser} size="xs" />
            {Math.round(feelsLikeMin)}°
          </div>
        ) : (
          <>{Math.round(temperatureMin)}°</>
        )}
      </div>
      <div className="temperatures flex justify-center items-center text-red-400 leading-tight">
        <FontAwesomeIcon icon={faTemperatureUp} size="sm" />

        {displayFeelsLike ? (
          <div className="inline-block">
            <FontAwesomeIcon icon={faUser} size="xs" />
            {Math.round(feelsLikeMax)}°
          </div>
        ) : (
          <>{Math.round(temperatureMax)}°</>
        )}
      </div>
    </div>
  );
}
