'use client';

import Loader from '@/app/components/Loader';
import EventsList from '@/app/components/modules/agenda/EventsList';
import TextFit from '@/app/components/TextFit';
import { AgendaProps } from '@/app/lib/definitions';
import { stringToNumber } from '@/app/lib/utils';
import { groupByDay, groupByMonth } from '@/app/lib/utils/agenda';
import { date2String, parseDate } from '@/app/lib/utils/date';
import {
  addDays,
  addWeeks,
  endOfWeek,
  isToday,
  isYesterday,
  startOfWeek,
  subWeeks,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { Event } from 'nylas';
import { useEffect, useRef, useState } from 'react';
import { useSpeechRecognition } from 'react-speech-recognition';

export default function Agenda(props: AgendaProps) {
  const ref = useRef(null);
  const [redirectUri, setRedirectUri] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [weeksToShow, setWeeksToShow] = useState(2);
  const [loading, setLoading] = useState(true);
  const [displayDate, setDisplayDate] = useState(new Date());
  const [displayDisplayDate, setDisplayDisplayDate] = useState(false);

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
          setDisplayDate(subWeeks(displayDate, 1));
        },
      },
      {
        command: ['(Affiche la) semaine suivante'],
        callback: () => {
          setDisplayDate(addWeeks(displayDate, 1));
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

  const id = props.id;
  const grantId = props.options?.grantId;
  const calendarId = props.options?.primaryCalendar.id;

  useEffect(() => {
    const getRedirectURI = async () => {
      try {
        const response = await fetch(`/api/nylas/oauth/url?moduleId=${id}`, {
          method: 'GET',
        });
        const { authUrl } = await response.json();
        setRedirectUri(authUrl);
      } catch (error) {
        console.error('Error fetching redirect URI:', error);
      } finally {
        setLoading(false);
      }
    };

    const getEvents = async (displayLoading = true) => {
      try {
        displayLoading && setLoading(true);

        isYesterday(displayDate) && setDisplayDate(new Date());

        const startDate = isToday(displayDate)
          ? displayDate
          : startOfWeek(displayDate, { locale: fr });
        const endDate = endOfWeek(addWeeks(displayDate, weeksToShow - 1), {
          locale: fr,
        });

        const start = date2String(
          addDays(startDate, isToday(displayDate) ? 0 : 1),
        );
        const end = date2String(addDays(endDate, 1));

        const response = await fetch(
          `/api/nylas/events?identifier=${grantId}&calendarId=${calendarId}&start=${start}&end=${end}`,
          {
            method: 'GET',
          },
        );
        const { events } = await response.json();
        setEvents(events || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!grantId) {
      getRedirectURI();
    } else {
      getEvents();
      const interval = setInterval(() => getEvents(false), 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [displayDate, id, grantId, calendarId, weeksToShow]);

  const handleAuth = () => {
    window.location.href = redirectUri;
  };

  const eventsByMonth = groupByMonth(groupByDay(events));

  return (
    <div className="relative size-full px-1" ref={ref}>
      {displayDisplayDate && <div>{displayDate.toLocaleString()}</div>}
      {loading ? (
        <Loader />
      ) : (
        <>
          {redirectUri ? (
            <button onClick={handleAuth}>Authenticate</button>
          ) : (
            <TextFit widthFactor={0.1} heightFactor={0.4} refParent={ref}>
              <EventsList eventsByMonth={eventsByMonth} />
            </TextFit>
          )}
        </>
      )}
    </div>
  );
}
