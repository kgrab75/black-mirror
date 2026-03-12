import { date2Time } from '@/app/lib/utils/date';
import { EventTimeProps } from '@/app/types/Agenda';
import { faCalendarDay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function EventTime({
  type,
  startTime,
  endTime,
}: EventTimeProps) {
  const isDateSpan = type === 'datespan';
  const isTimeSpan = type === 'timespan';
  const isMultidayTimeSpan = type === 'multidayTimespan';

  const hasTimeRange = Boolean(startTime || endTime);

  const showCalendarIcon = isDateSpan || (isMultidayTimeSpan && !hasTimeRange);

  const showFullTimeRange = isTimeSpan && startTime && endTime;
  const showPartialTimeRange = isMultidayTimeSpan && hasTimeRange;

  return (
    <div className="event-time my-1 flex min-w-[4em] flex-col flex-wrap items-center justify-between border-r-2 text-[0.5em] leading-none">
      {showCalendarIcon && (
        <div className="flex h-full flex-col justify-center">
          <FontAwesomeIcon icon={faCalendarDay} size="2x" />
        </div>
      )}

      {showFullTimeRange && (
        <TimeRange start={date2Time(startTime)} end={date2Time(endTime)} />
      )}

      {showPartialTimeRange && (
        <TimeRange
          start={startTime ? date2Time(startTime) : '--'}
          end={endTime ? date2Time(endTime) : '--'}
        />
      )}
    </div>
  );
}

type TimeRangeProps = {
  start: string;
  end: string;
};

function TimeRange({ start, end }: TimeRangeProps) {
  return (
    <div className="flex flex-col items-center gap-y-4">
      <div>{start}</div>
      <div>{end}</div>
    </div>
  );
}
