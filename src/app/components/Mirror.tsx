'use client';

import Grid from '@/app/components/Grid';
import Modules from '@/app/components/Modules';
import Views from '@/app/components/Views';
import ModulesProvider from '@/app/components/context/ModulesContext';
import NotificationProvider from '@/app/components/context/NotificationContext';
import WeatherLocationProvider, {
  initialWeatherLocation,
} from '@/app/components/context/WeatherLocationContext';
import useModules from '@/app/hooks/useModules';
import useViews from '@/app/hooks/useViews';
import { Module, WeatherLocation } from '@/app/lib/definitions';
import { ensure } from '@/app/lib/utils';
import clsx from 'clsx';
import Pusher from 'pusher-js';
import { useEffect, useState } from 'react';
import { useSpeechRecognition } from 'react-speech-recognition';

function extractWeatherLocation(modules: Module[]): WeatherLocation | null {
  for (const myModule of modules) {
    if (
      myModule.type === 'WeatherLocation' &&
      myModule.options &&
      'weatherLocation' in myModule.options
    ) {
      return myModule.options.weatherLocation;
    }
  }
  return null;
}

function reload() {
  location.reload();
}

export default function Mirror() {
  const [isEditing, setIsEditing] = useState(false);
  const [displayViews, setDisplayViews] = useState(false);
  const { views } = useViews();
  const { setModules } = useModules();
  const modules = ensure(views.find((view) => view.current)).modules;
  setModules(modules);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_PUSHER_APP_KEY) {
      const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY, {
        cluster: 'eu',
      });

      const channel = pusher.subscribe('black-mirror');
      channel.bind('deployed', reload);

      return () => {
        channel.unbind('deployed');
        pusher.unsubscribe('black-mirror');
      };
    }
  }, []);

  useSpeechRecognition({
    commands: [
      {
        command: ['Recharge la page'],
        callback: reload,
      },
      {
        command: ['Mode édition'],
        callback: () => {
          setIsEditing(true);
        },
      },
      {
        command: ["Valider l'édition", "Valide l'édition", "Arrête l'édition"],
        callback: () => {
          setIsEditing(false);
        },
      },
      {
        command: ['Affiche les vues'],
        callback: () => {
          setDisplayViews(true);
        },
      },
      {
        command: ['Cache les vues', 'affiche le miroir'],
        callback: () => {
          setDisplayViews(false);
        },
      },
    ],
  });

  const weatherLocation = extractWeatherLocation(modules);

  return (
    <div
      className={clsx(
        process.env.NODE_ENV !== 'production' &&
          '!w-[1080px] !h-[1920px] border border-white',
      )}
    >
      {displayViews ? (
        <Views />
      ) : (
        <>
          {isEditing && <Grid />}
          <ModulesProvider initialModules={modules}>
            <WeatherLocationProvider
              initialWeatherLocation={weatherLocation || initialWeatherLocation}
            >
              <NotificationProvider>
                <Modules isEditing={isEditing} displayInView={false} />
              </NotificationProvider>
            </WeatherLocationProvider>
          </ModulesProvider>
        </>
      )}
    </div>
  );
}
