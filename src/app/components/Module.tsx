'use client';

import { DraftProps, Modules } from '@/app/lib/definitions';

import useModules from '@/app/hooks/useModules';
import { updateModule } from '@/app/lib/actions';
import { Module as ModuleProps } from '@/app/lib/definitions';
import { label2type, stringToNumber } from '@/app/lib/utils';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { kebabCase } from 'change-case';
import { useSpeechRecognition } from 'react-speech-recognition';

import Draft from '@/app/components/modules/Draft';
import {
  Agenda,
  Clock,
  CurrentWeather,
  DailyForecastWeather,
  HourlyForecastWeather,
  Lists,
  Notification,
  Switch,
  Test,
  TodayDate,
  TodayPrecipitation,
  TodayTemp,
  WeatherLocation,
} from './modules';

export default function Module(props: ModuleProps) {
  const { setModules } = useModules();
  const {
    id,
    posX,
    posY,
    width,
    height,
    type,
    isEditing,
    visible,
    isPendingDeletion,
    displayInView,
  } = props;

  useSpeechRecognition({
    commands: [
      {
        command: ['Affiche le module :id', 'Montre le module :id'],
        callback: async (id) => {
          id = stringToNumber(id);
          if (id === props.id) {
            setModules(await updateModule(id, { visible: true }));
          }
        },
      },
      {
        command: ['Cache le module :id', 'Ne montre pas le module :id'],
        callback: async (id) => {
          id = stringToNumber(id);
          if (id === props.id) {
            setModules(await updateModule(id, { visible: false }));
          }
        },
      },
      {
        command: ['Affiche le module *', 'Montre le module *'],
        callback: async (label) => {
          if (label2type(label) === props.type) {
            setModules(await updateModule(id, { visible: true }));
          }
        },
      },
      {
        command: ['Cache le module *', 'Ne montre pas le module *'],
        callback: async (label) => {
          if (label2type(label) === props.type) {
            setModules(await updateModule(id, { visible: false }));
          }
        },
      },
    ],
  });

  const modules: Modules = {
    Agenda: Agenda,
    Draft: Draft,
    Clock: Clock,
    TodayDate: TodayDate,
    Notification: Notification,
    CurrentWeather: CurrentWeather,
    DailyForecastWeather: DailyForecastWeather,
    HourlyForecastWeather: HourlyForecastWeather,
    TodayTemp: TodayTemp,
    TodayPrecipitation: TodayPrecipitation,
    WeatherLocation: WeatherLocation,
    Switch: Switch,
    Lists: Lists,
    Test: Test,
  };

  const renderModule = (type: string, props: any) => {
    if (type in modules) {
      const moduleType = type as keyof Modules;
      const ModuleToRender = modules[moduleType];

      return ModuleToRender ? (
        <ModuleToRender {...props} />
      ) : (
        <div>Composant non trouvé</div>
      );
    }
    return <div>Composant non trouvé</div>;
  };

  const style = {
    gridColumn: `${posX} / span ${width}`,
    gridRow: `${posY} / span ${height}`,
  };

  const draftProps = props as DraftProps;

  return (
    <div
      className={`relative module module-${kebabCase(type)} ${
        isEditing && 'module-edit'
      } ${!visible && !isEditing && 'hidden'} ${
        isPendingDeletion && '!bg-red-500 opacity-30'
      }`}
      style={style}
    >
      {isEditing && !visible && (
        <FontAwesomeIcon icon={faEyeSlash} className="absolute left-1 top-1" />
      )}
      {isEditing && !displayInView && (
        <span className="h-6 w-6 rounded-full bg-blue-400 text-white text-center font-bold text-base absolute right-1 top-1 z-10">
          {id}
        </span>
      )}
      {displayInView ? (
        <Draft {...draftProps} />
      ) : (
        <>{renderModule(type, props)}</>
      )}
    </div>
  );
}
