import { EventsByDay, EventsByMonth } from "@/app/types/Agenda";
import { Event } from 'nylas';
import { date2String } from "@/app/lib/utils/date";


export const groupByDay = (events: Event[]) => {
  let needToRemoveFirst = true;
  const eventsByDay: EventsByDay[] = [];

  const formatedTodayDate = date2String(new Date());
  eventsByDay.push({
    date: formatedTodayDate,
    events: [{ type: 'datespan', title: 'Rien de prévu' }],
  });

  events.forEach((event) => {
    if (event.when.object === 'datespan') {
      if (event.when.startDate === formatedTodayDate && needToRemoveFirst) {
        eventsByDay.pop();
        needToRemoveFirst = false;
      }
      let currentDate = new Date(event.when.startDate);
      const endDate = new Date(event.when.endDate);
      const isSingleDayEvent = dateDiffInDays(currentDate, endDate) <= 1;
      const totalDays = Math.ceil(
        (endDate.valueOf() - +new Date(event.when.startDate)) /
        (1000 * 60 * 60 * 24)
      );
      let dayCounter = 1;

      while (currentDate < endDate) {
        const formattedDate = date2String(currentDate);

        let dateEntry = eventsByDay.find(
          (entry) => entry.date === formattedDate
        );
        if (!dateEntry) {
          dateEntry = { date: formattedDate, events: [] };
          eventsByDay.push(dateEntry);
        }

        dateEntry.events.push({
          type: event.when.object,
          title: isSingleDayEvent
            ? `${event.title}`
            : `${event.title} (jour ${dayCounter}/${totalDays})`,
        });

        currentDate.setDate(currentDate.getDate() + 1);
        dayCounter++;
      }
    } else if (event.when.object === 'timespan') {
      const formattedDate = date2String(new Date(event.when.startTime * 1000));
      if (formattedDate === formatedTodayDate && needToRemoveFirst) {
        eventsByDay.pop();
        needToRemoveFirst = false;
      }
      let dateEntry = eventsByDay.find((entry) => entry.date === formattedDate);
      if (!dateEntry) {
        dateEntry = { date: formattedDate, events: [] };
        eventsByDay.push(dateEntry);
      }

      dateEntry.events.push({
        type: event.when.object,
        title: event.title || 'Missing title',
        startTime: new Date(event.when.startTime * 1000),
        endTime: new Date(event.when.endTime * 1000),
      });
    }
  });

  return eventsByDay;
};

export const groupByMonth = (eventsByDay: EventsByDay[]) => {
  const eventsByMonth: EventsByMonth[] = [];

  eventsByDay.forEach((event) => {
    const date = new Date(event.date);
    let monthEntry = eventsByMonth.find(
      (entry) =>
        entry.year === date.getFullYear() && entry.month === date.getMonth()
    );
    if (!monthEntry) {
      monthEntry = {
        year: date.getFullYear(),
        month: date.getMonth(),
        eventsByDay: [],
      };
      eventsByMonth.push(monthEntry);
    }
    monthEntry.eventsByDay.push(event);
  });

  return eventsByMonth;
};

const dateDiffInDays = (a: Date, b: Date) => {
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
};