import {
  faBell,
  faCalendarDays,
  faClock,
  faCloudSun,
  faSun,
  faCompassDrafting,
  faTemperatureHalf,
  faUmbrella,
  faMapLocationDot,
  faLightbulb,
  faListCheck,
  faSubway,
  faWeightScale,
} from '@fortawesome/free-solid-svg-icons';
import { DraftProps, Module, ModuleDetail } from '@/app/lib/definitions';

export const moduleDetails: ModuleDetail[] = [
  {
    type: 'Agenda',
    labels: ['agenda', 'calendrier'],
    icon: faCalendarDays,
  },
  {
    type: 'Draft',
    labels: ['ébauche'],
    icon: faCompassDrafting,
  },
  {
    type: 'Clock',
    labels: ['horloge'],
    icon: faClock,
  },
  {
    type: 'TodayDate',
    labels: ['date du jour'],
    icon: faCalendarDays,
  },
  {
    type: 'Notification',
    labels: ['notification'],
    icon: faBell,
  },
  {
    type: 'CurrentWeather',
    labels: ['météo actuelle'],
    icon: faCloudSun,
  },
  {
    type: 'DailyForecastWeather',
    labels: ['météo quotidienne'],
    icon: faSun,
  },
  {
    type: 'HourlyForecastWeather',
    labels: ['météo horaires', 'météo horaire'],
    icon: faSun,
  },
  {
    type: 'TodayTemp',
    labels: ['température du jour'],
    icon: faTemperatureHalf,
  },
  {
    type: 'TodayPrecipitation',
    labels: ['précipitation du jour'],
    icon: faUmbrella,
  },
  {
    type: 'WeatherLocation',
    labels: ['localisation de la météo', 'localisation'],
    icon: faMapLocationDot,
  },
  {
    type: 'Switch',
    labels: ['contrôle des lumières', 'lumière', 'lumières'],
    icon: faLightbulb,
  },
  {
    type: 'Lists',
    labels: ['listes', 'liste'],
    icon: faListCheck,
  },
  {
    type: 'StopWatcher',
    labels: ['info transport'],
    icon: faSubway,
  },
  {
    type: 'Weight',
    labels: ['poids'],
    icon: faWeightScale,
  },
];

export const moduleKeysInfo = {
  id: { label: 'identifiant' },
  posX: { label: 'position horizontale' },
  posY: { label: 'position verticale' },
  width: { label: 'largeur' },
  height: { label: 'hauteur' },
  type: { label: 'type' },
  visible: { label: 'visible' },
};

export function ensure<T>(
  argument: T | undefined | null,
  message: string = 'This value was promised to be there.',
): T {
  if (argument === undefined || argument === null) {
    throw new TypeError(message);
  }

  return argument;
}

export function type2label(type: 'string'): string {
  return ensure(
    moduleDetails.find((module) => module.type === type)?.labels[0],
  );
}

export function label2type(label: string): string | undefined {
  return moduleDetails.find((module) =>
    module.labels.includes(label.toLocaleLowerCase()),
  )?.type;
}

export function labelExists(label: string) {
  return moduleDetails.some((module) =>
    module.labels.includes(label.toLocaleLowerCase()),
  );
}

export function getDraftModule(modules: Module[]) {
  return (
    (modules.find((module) => module.type === 'Draft') as DraftProps) ?? null
  );
}

export function stringToNumber(string: string | number): number {
  if (string === 'une' || string === 'un') return 1;
  if (string === 'de') return 2;
  return Number(string);
}

export function getIcon(typeString: string) {
  return ensure(moduleDetails.find((module) => module.type === typeString))
    .icon;
}
