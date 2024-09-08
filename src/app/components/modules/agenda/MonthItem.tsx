import DayItem from '@/app/components/modules/agenda/DayItem';
import { date2Month, dateFromYearMonth } from '@/app/lib/utils/date';
import { MonthItemProps } from '@/app/types/Agenda';

export default function MonthItem({
  year,
  month,
  eventsByDay,
}: MonthItemProps) {
  const monthName = date2Month(dateFromYearMonth(year, month));

  return (
    <div className="month">
      <div className="month-name text-center capitalize">{monthName}</div>
      <div className="days">
        {eventsByDay.map((day) => (
          <DayItem key={day.date} date={day.date} events={day.events} />
        ))}
      </div>
    </div>
  );
}
