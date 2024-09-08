import EventItem from '@/app/components/modules/agenda/EventItem';
import { date2Day, date2String } from '@/app/lib/utils/date';
import { DayItemProps } from '@/app/types/Agenda';

export default function DayItem({ date, events }: DayItemProps) {
  const isToday = date === date2String(new Date());

  return (
    <div
      className={`day flex border-b ${isToday && 'bg-blue-400 bg-opacity-40'}`}
    >
      <div className="flex items-center text-center bg-white bg-opacity-20 leading-none text-base rounded-br-3xl mr-1 h-9 max-w-11 p-1">
        {date2Day(date)}
      </div>
      <div className="events w-full">
        {events.map((event, index) => (
          <EventItem key={index} event={event} />
        ))}
      </div>
    </div>
  );
}
