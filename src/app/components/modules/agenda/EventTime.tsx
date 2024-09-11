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
    <div className="event-time text-xs leading-none border-r-2 flex items-center min-w-[3em] justify-between flex-col flex-wrap text-[0.5em] my-1">
      {type === 'timespan' && startTime && endTime ? (
        <>
          <div>{date2Time(startTime)}</div>
          <br />
          <div>{date2Time(endTime)}</div>
        </>
      ) : (
        <FontAwesomeIcon icon={faCalendarDay} size="2x" />
      )}
    </div>
  );
}
