'use client';

import Loader from '@/app/components/Loader';
import EventsList from '@/app/components/modules/agenda/EventsList';
import TextFit from '@/app/components/TextFit';
import { AgendaProps } from '@/app/lib/definitions';
import { stringToNumber } from '@/app/lib/utils';
import { groupByDay, groupByMonth } from '@/app/lib/utils/agenda';
import { date2String, parseDate } from '@/app/lib/utils/date';
import { addWeeks, endOfWeek, isToday, startOfWeek, subWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Event } from 'nylas';
import Pusher from 'pusher-js';
import { QRCodeCanvas } from 'qrcode.react';
import { useEffect, useRef, useState } from 'react';
import { useSpeechRecognition } from 'react-speech-recognition';

export default function Agenda(props: AgendaProps) {
  const ref = useRef(null);
  const [grantId, setGrantId] = useState(props.options.grantId || '');
  const [calendarId, setCalendarId] = useState(
    props.options.primaryCalendar?.id || '',
  );
  const [events, setEvents] = useState<Event[]>([]);
  const [weeksToShow, setWeeksToShow] = useState(2);
  const [loading, setLoading] = useState(true);
  const [displayDate, setDisplayDate] = useState(new Date());
  const [displayDisplayDate, setDisplayDisplayDate] = useState(false);

  const pusherRef = useRef<Pusher | null>(null);

  const [isPusherReady, setIsPusherReady] = useState(false);
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PUSHER_APP_KEY) return;

    pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY, {
      cluster: 'eu',
    });
    setIsPusherReady(true);

    return () => {
      pusherRef.current?.disconnect();
      pusherRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isPusherReady || !pusherRef.current) return;

    const channelName = `agenda-${props.id}`;
    const eventName = 'access-granted';

    const channel = pusherRef.current.subscribe(channelName);

    const handleAccessGranted = (data: {
      grantId?: string;
      calendarId?: string;
    }) => {
      setGrantId(data.grantId || '');
      setCalendarId(data.calendarId || '');
    };

    channel.bind(eventName, handleAccessGranted);

    return () => {
      channel.unbind(eventName, handleAccessGranted);
      pusherRef.current?.unsubscribe(channelName);
    };
  }, [isPusherReady, props.id]);

  useEffect(() => {
    if (!isPusherReady || !pusherRef.current || !grantId) return;

    const channelName = `agenda-${grantId}`;
    const eventName = 'events-updated';

    const channel = pusherRef.current.subscribe(channelName);

    const handleEventsUpdated = () => {
      setDisplayDate(new Date());
    };

    channel.bind(eventName, handleEventsUpdated);

    return () => {
      channel.unbind(eventName, handleEventsUpdated);
      pusherRef.current?.unsubscribe(channelName);
    };
  }, [grantId, isPusherReady]);

  useSpeechRecognition({
    commands: [
      {
        command: ['Affiche la date'],
        callback: () => {
          setDisplayDisplayDate(true);
        },
      },
      {
        command: ['Cache la date'],
        callback: () => {
          setDisplayDisplayDate(false);
        },
      },
      {
        command: [
          '(Affiche) :weeksToShow semaine',
          '(Affiche) :weeksToShow semaines',
        ],
        callback: (weeksToShow) => {
          setWeeksToShow(stringToNumber(weeksToShow));
        },
      },
      {
        command: ['(Affiche la) semaine précédente'],
        callback: () => {
          setDisplayDate((prev) => subWeeks(prev, 1));
        },
      },
      {
        command: ['(Affiche la) semaine suivante'],
        callback: () => {
          setDisplayDate((prev) => addWeeks(prev, 1));
        },
      },
      {
        command: [
          "(Affiche le) planning d'aujourd'hui",
          '(Affiche la) semaine courante',
          '(Affiche la) semaine actuelle',
        ],
        callback: () => {
          setDisplayDate(new Date());
        },
      },
      {
        command: ['(Affiche la) semaine du *'],
        callback: (date) => {
          const parsedDate = parseDate(date);
          setDisplayDate(parsedDate);
        },
      },
    ],
  });

  const authUrl = new URL(
    `/api/nylas/oauth/url?moduleId=${props.id}`,
    process.env.NEXT_PUBLIC_REAL_BASE_URL,
  ).toString();

  const hasAccess = !!grantId;

  useEffect(() => {
    let cancelled = false;

    const getEvents = async (displayLoading = true) => {
      try {
        if (displayLoading) setLoading(true);

        const startDate = isToday(displayDate)
          ? displayDate
          : startOfWeek(displayDate, { locale: fr });
        const endDate = endOfWeek(addWeeks(displayDate, weeksToShow - 1), {
          locale: fr,
        });

        const start = date2String(startDate);
        const end = date2String(endDate);
        const range = `start=${start}&end=${end}`;

        const url = `/api/nylas/events?identifier=${grantId}&calendarId=${calendarId}&${range}`;

        const response = await fetch(url, { method: 'GET' });
        if (!response.ok) {
          throw new Error(`Failed to fetch events: ${response.status}`);
        }
        const { events }: { events: Event[] } = await response.json();

        const acceptedEvents = events.filter((event) => {
          const participants = event.participants ?? [];
          return (
            participants.some(
              (participant) =>
                participant.email === props.options.primaryCalendar?.id &&
                participant.status === 'yes',
            ) ||
            (participants.length === 0 && event.status === 'confirmed')
          );
        });
        console.log({ eventsIn: acceptedEvents });

        if (!cancelled) {
          setEvents(acceptedEvents);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching events:', error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (hasAccess) {
      getEvents(true);
    }

    return () => {
      cancelled = true;
    };
  }, [
    displayDate,
    grantId,
    calendarId,
    weeksToShow,
    hasAccess,
    props.options.primaryCalendar?.id,
  ]);

  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setHours(24, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    let interval: ReturnType<typeof setInterval> | null = null;

    const timeout = setTimeout(() => {
      setDisplayDate(new Date());

      interval = setInterval(
        () => {
          setDisplayDate(new Date());
        },
        24 * 60 * 60 * 1000,
      );
    }, msUntilMidnight);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, []);
  const eventsGroupByDay = groupByDay(events);
  console.log({ eventsOut: eventsGroupByDay });
  const eventsByMonth = groupByMonth(eventsGroupByDay);

  return (
    <div className="relative size-full px-1" ref={ref}>
      {displayDisplayDate && <div>{displayDate.toLocaleString()}</div>}
      {loading && hasAccess ? (
        <Loader />
      ) : (
        <>
          {hasAccess ? (
            <TextFit widthFactor={0.1} heightFactor={0.4} refParent={ref}>
              <EventsList eventsByMonth={eventsByMonth} />
            </TextFit>
          ) : (
            <div className="fixed">
              <QRCodeCanvas value={authUrl} size={512} marginSize={1} />
              <a href={authUrl} target="_blank" rel="noopener noreferrer">
                {authUrl}
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
