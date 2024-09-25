import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { StopWatcher, type StopSchedule } from '@kgrab75/stop-watcher';
import clsx from 'clsx';

const getRelativeTime = (date: string | Date) => {
  const dateDate = new Date(date);
  const now = new Date();
  const diffInMs = dateDate.getTime() - now.getTime();
  return Math.round(diffInMs / (1000 * 60));
};

export default function Stop({ stopSchedule }: { stopSchedule: StopSchedule }) {
  if (stopSchedule.directions.length === 0) return;
  const stopName = stopSchedule.stop;
  const line = stopSchedule.line;

  const lineName = line.name;
  const mode = line.mode;
  const lineColor = `#${line.color}`;
  const lineTextColor = `#${line.textColor}`;

  const busClasses = clsx(
    'w-[1.8em] h-[1em] leading-[1] font-bold text-center tracking-[-0.05em]',
  );

  const noctilienClasses = clsx(
    'w-[2em] h-[1.1em] leading-[1] font-bold text-center text-[0.8em] first-letter:text-[0.6em] first-letter:align-super first-letter:mr-[0.2em]',
  );

  const metroClasses = clsx(
    'w-[1.4em] h-[1.4em] rounded-full leading-[1.4] font-bold text-center',
  );

  const tramClasses = clsx(
    'w-[2em] h-[1.4em] leading-[1] font-bold text-center',
  );

  const rerClasses = clsx(
    'w-[1.4em] h-[1.4em] leading-[1.4] font-bold text-center rounded-[0.2em]',
  );

  let transportStyle = {};
  let transportClasses = '';
  switch (mode) {
    case StopWatcher.MODE.METRO:
      transportStyle = { backgroundColor: lineColor, color: lineTextColor };
      transportClasses = metroClasses;
      break;
    case StopWatcher.MODE.BUS:
      if (line.name.startsWith('N')) {
        transportStyle = { backgroundColor: lineColor, color: lineTextColor };
        transportStyle = {
          backgroundColor: '#0A0082',
          color: lineTextColor,
          borderBottom: `0.1em solid ${lineColor}`,
        };
        transportClasses = noctilienClasses;
      } else {
        transportStyle = { backgroundColor: lineColor, color: lineTextColor };
        transportClasses = busClasses;
      }

      break;
    case StopWatcher.MODE.BUS:
      transportStyle = { backgroundColor: lineColor, color: lineTextColor };
      transportClasses = busClasses;
      break;
    case StopWatcher.MODE.TRAM:
      transportStyle = {
        backgroundColor: 'white',
        color: 'black',
        borderTop: `0.2em solid ${lineColor}`,
        borderBottom: `0.2em solid ${lineColor}`,
      };
      transportClasses = tramClasses;
      break;
    default:
      transportStyle = { backgroundColor: lineColor, color: lineTextColor };
      transportClasses = rerClasses;
      break;
  }

  return (
    <div className="stop border-b-4 last:border-b-0">
      <div className="stop-head flex items-center border-b-[0.1em] py-[0.05em]">
        <div className="stop-name w-full text-balance text-center leading-tight">
          {stopName}
        </div>
        <div className="line-info px-[0.1em]">
          <div style={transportStyle} className={`${transportClasses}`}>
            {lineName}
          </div>
        </div>
      </div>
      <div className="stop-container">
        {stopSchedule.directions.map(
          (direction, index) =>
            direction.upcomingDepartures.length > 0 && (
              <div
                className="stop p-[0.1em] flex items-center text-[0.7em]  border-b-[0.05em] last:border-b-0"
                key={index}
              >
                <div className="arrow px-[0.1em] border-r-4 mr-[0.2em]">
                  <FontAwesomeIcon icon={faArrowRight} />
                </div>
                <div className="flex flex-col w-full">
                  <div className="direction text-center leading-none p-[0.1em]">
                    {direction.name}
                  </div>
                  <div className="times flex">
                    {direction.upcomingDepartures.map(
                      (upcomingDeparture, index) =>
                        getRelativeTime(upcomingDeparture.next) !== 0 && (
                          <div
                            key={`time-${index}`}
                            className="bg-blue-900 text-yellow-300 rounded w-[3.4em] h-[1.2em] text-[0.8em] text-center mr-[0.4em] leading-[1.2] font-bold text-nowrap"
                          >
                            {getRelativeTime(upcomingDeparture.next)} min
                          </div>
                        ),
                    )}
                  </div>
                </div>
              </div>
            ),
        )}
      </div>
    </div>
  );
}
