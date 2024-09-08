import EventTime from '@/app/components/modules/agenda/EventTime';
import { EventItemProps } from '@/app/types/Agenda';

export default function EventItem({ event }: EventItemProps) {
  const { title, type, endTime, startTime } = event;

  return (
    <div className="event flex mb-1 bg-white bg-opacity-10 rounded-md">
      <EventTime type={type} startTime={startTime} endTime={endTime} />
      <div className="event-title text-ellipsis whitespace-break-spaces flex items-center pl-1 leading-tight">
        {title}
      </div>
    </div>
  );
}
