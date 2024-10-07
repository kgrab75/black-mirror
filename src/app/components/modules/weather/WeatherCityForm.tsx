import TextFit from '@/app/components/TextFit';
import { updateModule } from '@/app/lib/actions';
import { openWeatherAPI } from '@/app/lib/data/OpenWeatherAPI';
import { WeatherLocation } from '@/app/lib/definitions';
import { faCloudSun } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SetStateAction, useRef, useState } from 'react';
import { useSpeechRecognition } from 'react-speech-recognition';

export default function WeatherCityForm({
  id,
  weatherLocation,
  setWeatherLocation,
  setError,
}: {
  id: number;
  weatherLocation: WeatherLocation;
  setWeatherLocation: React.Dispatch<React.SetStateAction<WeatherLocation>>;
  setError: React.Dispatch<SetStateAction<string>>;
}) {
  const ref = useRef(null);
  const [city, setCity] = useState(weatherLocation.name || 'Paris');

  useSpeechRecognition({
    commands: [
      {
        command: [`(Affiche la) météo de *`],
        callback: async (city) => await handleCityChange(city),
      },
    ],
  });

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleCityChange(city);
  };

  async function handleCityChange(city: string) {
    const language = process.env.LOCALE_2_LETTER as string;
    try {
      const dataLocation = await openWeatherAPI.getLocation({
        locationName: city,
      });
      const correctCityName: string =
        dataLocation?.local_names?.[language] ?? dataLocation?.name;
      if (correctCityName && dataLocation) {
        const newWeatherLocation = {
          name: correctCityName,
          lat: dataLocation.lat,
          lon: dataLocation.lon,
        };
        setWeatherLocation(newWeatherLocation);
        setCity(newWeatherLocation.name);

        updateModule(id, {
          options: { weatherLocation: newWeatherLocation },
        });
      }
      setError('');
    } catch (error) {
      setError(`${city} n'existe pas`);
    }
  }
  return (
    <div className="relative size-full" ref={ref}>
      <TextFit heightFactor={1} widthFactor={0.1} refParent={ref}>
        <div className="absolute size-full opacity-10 flex content-center justify-center flex-wrap p-5 text-[6em]">
          <FontAwesomeIcon icon={faCloudSun} className="size-full" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="size-full flex flex-col justify-center text-[1em]"
          
        >
          <label htmlFor="city" className="flex justify-center">
            Météo de
          </label>
          <input
            name="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="text-center w-full bg-transparent"
          />
          <input type="submit" className="hidden" />
        </form>
      </TextFit>
    </div>
  );
}
