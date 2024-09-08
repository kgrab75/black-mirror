

export type EventWithDay = {
    type: 'datespan';
    title: string;
};

export type EventWithTime = {
    type: 'timespan';
    title: string;
    startTime: Date;
    endTime: Date;
};

export type EventType = EventWithDay | EventWithTime;

export type EventsByDay = {
    date: string;
    events: EventType[];
};

export type EventsByMonth = {
    year: number;
    month: number;
    eventsByDay: EventsByDay[];
};

export type EventsListProps = {
    eventsByMonth: MonthItemProps[];
};

export type MonthItemProps = {
    year: number;
    month: number;
    eventsByDay: DayItemProps[];
};

export type DayItemProps = {
    date: string;
    events: EventProps[];
};

export type EventItemProps = {
    event: EventProps;
};

type EventProps = EventTimeProps & { title: string };

export type EventTimeProps = {
    type: 'datespan' | 'timespan';
    startTime?: Date;
    endTime?: Date;
};