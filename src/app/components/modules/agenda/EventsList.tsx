import MonthItem from '@/app/components/modules/agenda/MonthItem';
import { EventsListProps } from '@/app/types/Agenda';

export default function EventsList({ eventsByMonth }: EventsListProps) {
  return (
    <div className="events">
      {eventsByMonth.map((eventByMonth) => (
        <MonthItem
          key={`${eventByMonth.year}${eventByMonth.month}`}
          year={eventByMonth.year}
          month={eventByMonth.month}
          eventsByDay={eventByMonth.eventsByDay}
        />
      ))}
    </div>
  );
}
