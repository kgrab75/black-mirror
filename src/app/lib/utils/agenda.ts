import { isExactlyMidnightInTimeZone } from '@/app/lib/utils/date';
import { EventsByDay, EventsByMonth, EventType } from '@/app/types/Agenda';
import { Event } from 'nylas';

const DAY_PLACEHOLDER_TITLE = 'Rien de prévu';
const DEFAULT_TIMEZONE = 'Europe/Paris';

type DateSpanEvent = Event & {
  when: Extract<Event['when'], { object: 'datespan' }>;
};

type TimeSpanEvent = Event & {
  when: Extract<Event['when'], { object: 'timespan' }>;
};

const isDateSpanEvent = (event: Event): event is DateSpanEvent =>
  event.when.object === 'datespan';

const isTimeSpanEvent = (event: Event): event is TimeSpanEvent =>
  event.when.object === 'timespan';

export const groupByDay = (
  events: Event[],
  options?: {
    todayTimezone?: string;
    defaultEventTimezone?: string;
  },
): EventsByDay[] => {
  const todayTimezone = options?.todayTimezone ?? DEFAULT_TIMEZONE;
  const defaultEventTimezone =
    options?.defaultEventTimezone ?? DEFAULT_TIMEZONE;

  const todayKey = getDateKeyInTimeZone(new Date(), todayTimezone);

  const eventsByDayMap = new Map<string, EventType[]>();
  eventsByDayMap.set(todayKey, [
    { type: 'datespan', title: DAY_PLACEHOLDER_TITLE },
  ]);

  for (const event of events) {
    if (isDateSpanEvent(event)) {
      addDateSpanEvent(eventsByDayMap, event, todayKey);
      continue;
    }

    if (isTimeSpanEvent(event)) {
      const eventTimezone =
        event.when.startTimezone ||
        event.when.endTimezone ||
        defaultEventTimezone;

      addTimeSpanEvent(eventsByDayMap, event, todayKey, eventTimezone);
    }
  }

  return Array.from(eventsByDayMap.entries())
    .sort(([dateA], [dateB]) => compareDateKeys(dateA, dateB))
    .map(([date, dayEvents]) => ({
      date,
      events: dayEvents,
    }));
};

export const groupByMonth = (eventsByDay: EventsByDay[]): EventsByMonth[] => {
  const eventsByMonthMap = new Map<string, EventsByMonth>();

  for (const day of eventsByDay) {
    const { year, month } = parseDateKey(day.date);
    const monthIndex = month - 1;
    const key = `${year}-${String(month).padStart(2, '0')}`;

    let monthEntry = eventsByMonthMap.get(key);

    if (!monthEntry) {
      monthEntry = {
        year,
        month: monthIndex,
        eventsByDay: [],
      };
      eventsByMonthMap.set(key, monthEntry);
    }

    monthEntry.eventsByDay.push(day);
  }

  return Array.from(eventsByMonthMap.values()).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });
};

const addDateSpanEvent = (
  eventsByDayMap: Map<string, EventType[]>,
  event: DateSpanEvent,
  todayKey: string,
) => {
  const startKey = event.when.startDate;
  const endExclusiveKey = event.when.endDate;

  if (compareDateKeys(startKey, endExclusiveKey) >= 0) {
    return;
  }

  const coversToday =
    compareDateKeys(startKey, todayKey) <= 0 &&
    compareDateKeys(todayKey, endExclusiveKey) < 0;

  if (coversToday) {
    removePlaceholderForToday(eventsByDayMap, todayKey);
  }

  const totalDays = diffDateKeys(startKey, endExclusiveKey);
  const isSingleDayEvent = totalDays === 1;

  let currentKey = startKey;
  let dayCounter = 1;

  while (compareDateKeys(currentKey, endExclusiveKey) < 0) {
    if (compareDateKeys(currentKey, todayKey) >= 0) {
      addEntryToDay(eventsByDayMap, currentKey, {
        type: 'datespan',
        title: isSingleDayEvent
          ? event.title || 'Missing title'
          : `${event.title || 'Missing title'} (jour ${dayCounter}/${totalDays})`,
      });
    }

    currentKey = addDaysToDateKey(currentKey, 1);
    dayCounter++;
  }
};

const addTimeSpanEvent = (
  eventsByDayMap: Map<string, EventType[]>,
  event: TimeSpanEvent,
  todayKey: string,
  timeZone: string,
) => {
  const startAt = new Date(event.when.startTime * 1000);
  const endAt = new Date(event.when.endTime * 1000);

  const startKey = getDateKeyInTimeZone(startAt, timeZone);
  const rawEndKey = getDateKeyInTimeZone(endAt, timeZone);

  const endDisplayKey = isExactlyMidnightInTimeZone(endAt, timeZone)
    ? addDaysToDateKey(rawEndKey, -1)
    : rawEndKey;

  if (compareDateKeys(endDisplayKey, startKey) < 0) {
    addEntryToDay(eventsByDayMap, startKey, {
      type: 'timespan',
      title: event.title || 'Missing title',
      startTime: startAt,
      endTime: endAt,
    });

    if (startKey === todayKey) {
      removePlaceholderForToday(eventsByDayMap, todayKey);
    }

    return;
  }

  const coversToday =
    compareDateKeys(startKey, todayKey) <= 0 &&
    compareDateKeys(todayKey, endDisplayKey) <= 0;

  if (coversToday) {
    removePlaceholderForToday(eventsByDayMap, todayKey);
  }

  const isSingleDayEvent = startKey === endDisplayKey;

  if (isSingleDayEvent) {
    addEntryToDay(eventsByDayMap, startKey, {
      type: 'timespan',
      title: event.title || 'Missing title',
      startTime: startAt,
      endTime: endAt,
    });
    return;
  }

  const totalDays = diffDateKeysInclusive(startKey, endDisplayKey);

  let currentKey = startKey;
  let dayCounter = 1;

  while (compareDateKeys(currentKey, endDisplayKey) <= 0) {
    if (compareDateKeys(currentKey, todayKey) >= 0) {
      addEntryToDay(eventsByDayMap, currentKey, {
        type: 'multidayTimespan',
        title: `${event.title || 'Missing title'} (jour ${dayCounter}/${totalDays})`,
        startTime: dayCounter === 1 ? startAt : undefined,
        endTime: dayCounter === totalDays ? endAt : undefined,
      });
    }

    currentKey = addDaysToDateKey(currentKey, 1);
    dayCounter++;
  }
};

const addEntryToDay = (
  eventsByDayMap: Map<string, EventType[]>,
  dateKey: string,
  entry: EventType,
) => {
  const currentEntries = eventsByDayMap.get(dateKey) ?? [];
  eventsByDayMap.set(dateKey, [...currentEntries, entry]);
};

const removePlaceholderForToday = (
  eventsByDayMap: Map<string, EventType[]>,
  todayKey: string,
) => {
  const todayEntries = eventsByDayMap.get(todayKey);
  if (!todayEntries) return;

  const filtered = todayEntries.filter(
    (entry) =>
      !(entry.type === 'datespan' && entry.title === DAY_PLACEHOLDER_TITLE),
  );

  eventsByDayMap.set(todayKey, filtered);
};

const getDateKeyInTimeZone = (date: Date, timeZone: string): string => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(date);

  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  if (!year || !month || !day) {
    throw new Error(`Unable to format date in timezone "${timeZone}"`);
  }

  return `${year}-${month}-${day}`;
};

const parseDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-').map(Number);

  if (!year || !month || !day) {
    throw new Error(`Invalid date key "${dateKey}"`);
  }

  return { year, month, day };
};

const compareDateKeys = (a: string, b: string) => {
  return a.localeCompare(b);
};

const addDaysToDateKey = (dateKey: string, days: number) => {
  const { year, month, day } = parseDateKey(dateKey);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);

  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');

  return `${y}-${m}-${d}`;
};

const diffDateKeys = (startKey: string, endExclusiveKey: string) => {
  const start = dateKeyToUtcMs(startKey);
  const end = dateKeyToUtcMs(endExclusiveKey);

  return Math.floor((end - start) / MS_PER_DAY);
};

const diffDateKeysInclusive = (startKey: string, endKey: string) => {
  return diffDateKeys(startKey, addDaysToDateKey(endKey, 1));
};

const dateKeyToUtcMs = (dateKey: string) => {
  const { year, month, day } = parseDateKey(dateKey);
  return Date.UTC(year, month - 1, day);
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;
