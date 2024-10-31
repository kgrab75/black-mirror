import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { Calendar, Draft } from 'nylas';
import { CurrentWeather } from 'openweather-api-node';
import { FC } from 'react';
import {
  Agenda,
  Clock,
  CurrentWeather as CurrentWeatherBis,
  DailyForecastWeather,
  Draft as DraftBis,
  HourlyForecastWeather,
  Lists,
  Switch,
  StopWatcher,
  TodayDate,
  TodayPrecipitation,
  TodayTemp,
  WeatherLocation,
} from '../components/modules';

export const moduleInputs = ['posX', 'posY', 'width', 'height'] as const;
export type ModuleInputsType = (typeof moduleInputs)[number];

export interface View {
  id: number;
  name: string;
  current: boolean;
  modules: Module[];
}

export type NewView = Omit<View, 'id'>;

export interface ModuleProps {
  id: number;
  type: string;
  posX: number;
  posY: number;
  width: number;
  height: number;
  visible: boolean;
  display: boolean;
  isPendingDeletion?: boolean;
  temporaryType: string;
  isEditing?: boolean;
  displayInView?: boolean;
  options: {};
}

export interface WeatherLocationProps extends ModuleProps {
  type: 'WeatherLocation';
  options: WeatherLocationOptions;
}

export interface ListsProps extends ModuleProps {
  type: 'Lists';
  options: ListsOptions;
}

export interface WeightProps extends ModuleProps {
  type: 'Weight';
  options: WeightOptions;
}

export interface AgendaProps extends ModuleProps {
  type: 'Agenda';
  options: AgendaOptions;
}

export interface DraftProps extends ModuleProps {
  type: 'Draft';
}

export interface WeatherLocation {
  name: string;
  lat: number;
  lon: number;
}

interface WeatherLocationOptions {
  weatherLocation: WeatherLocation;
}

interface ListsOptions {
  currentListUuid: string;
}

interface WeightOptions {
  access_token?: string;
  refresh_token?: string;
}

interface AgendaOptions {
  grantId: string;
  primaryCalendar: Calendar;
  webhookSecret: string;
}

export type Module =
  | ModuleProps
  | WeatherLocationProps
  | ListsProps
  | AgendaProps
  | DraftProps
  | WeightProps;

export type Dimensions = {
  height?: number;
  width?: number;
  posX?: number;
  posY?: number;
};

export type NewModule = Omit<Module, 'id'>;

export type ModuleDetailType =
  | FC<ModuleProps>
  | FC<WeatherLocationProps>
  | FC<ListsProps>
  | FC<AgendaProps>
  | FC<DraftProps>;

export interface ModuleDetail {
  // type: typeof Agenda | typeof Clock | typeof CurrentWeatherBis | typeof DraftBis | typeof DailyForecastWeather | typeof HourlyForecastWeather | typeof Lists | typeof Notification | typeof Switch | typeof TodayDate | typeof TodayPrecipitation | typeof TodayTemp | typeof WeatherLocation | typeof Test;
  type: string;
  labels: string[];
  icon: IconDefinition;
}

export interface Modules {
  Agenda: (props: AgendaProps) => JSX.Element;
  Draft: (props: DraftProps) => JSX.Element;
  Clock: (props: ModuleProps) => JSX.Element;
  TodayDate: (props: ModuleProps) => JSX.Element;
  Notification: (props: ModuleProps) => JSX.Element;
  CurrentWeather: (props: ModuleProps) => JSX.Element;
  DailyForecastWeather: (props: ModuleProps) => JSX.Element;
  HourlyForecastWeather: (props: ModuleProps) => JSX.Element;
  TodayTemp: (props: ModuleProps) => JSX.Element;
  TodayPrecipitation: (props: ModuleProps) => JSX.Element;
  WeatherLocation: (props: WeatherLocationProps) => JSX.Element;
  Switch: (props: ModuleProps) => JSX.Element;
  Lists: (props: ListsProps) => JSX.Element;
  StopWatcher: (props: ModuleProps) => JSX.Element;
  Weight: (props: WeightProps) => JSX.Element;
}
