import { date2Time } from '@/app/lib/utils/date';
import { EventTimeProps } from '@/app/types/Agenda';
import { faCalendarDay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function EventTime({
  type,
  startTime,
  endTime,
}: EventTimeProps) {
  return (
    <div className="event-time text-xs leading-none p-1 border-r-2 flex items-center w-10 justify-center">
      {type === 'timespan' && startTime && endTime ? (
        <>
          {date2Time(startTime)}
          <br />
          {date2Time(endTime)}
        </>
      ) : (
        <FontAwesomeIcon icon={faCalendarDay} size="2x" />
      )}
    </div>
  );
}
