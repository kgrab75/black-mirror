'use client';

import TextFit from '@/app/components/TextFit';
import { ModuleProps } from '@/app/lib/definitions';
import { CSSProperties, useEffect, useRef, useState } from 'react';
import { useSpeechRecognition } from 'react-speech-recognition';

function useDate(): Date {
  const [date, setDate] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => {
      setDate(new Date());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return date;
}

export default function TodayDate(props: ModuleProps) {
  const ref = useRef(null);
  const date: Date = useDate();

  const [displayWeekDay, setDisplayWeekDay] = useState(false);
  const [displayYear, setDisplayYear] = useState(false);

  useSpeechRecognition({
    commands: [
      {
        command: [
          'Affiche le jour (de la semaine)',
          'Montre le jour (de la semaine)',
        ],
        callback: () => setDisplayWeekDay(true),
      },
      {
        command: [
          "N'affiche pas le jour (de la semaine)",
          'Ne montre pas le jour (de la semaine)',
          'Cache le jour (de la semaine)',
        ],
        callback: () => setDisplayWeekDay(false),
      },
      {
        command: ["Affiche l'année", "Montre l'année"],
        callback: () => setDisplayYear(true),
      },
      {
        command: [
          "N'affiche pas l'année",
          "Ne montre pas l'année",
          "Cache l'année",
        ],
        callback: () => setDisplayYear(false),
      },
      {
        command: 'Reset',
        callback: ({ resetTranscript }) => resetTranscript(),
      },
    ],
  });

  const options: Intl.DateTimeFormatOptions = {
    dateStyle: displayWeekDay ? 'full' : 'long',
  };

  let todayDate = date.toLocaleDateString(process.env.LOCALE, options);

  if (!displayYear) {
    todayDate = todayDate.slice(0, -5);
  }

  const optionsWeekday: Intl.DateTimeFormatOptions = { weekday: 'long' };
  const weekday: string = new Intl.DateTimeFormat(
    'fr-FR',
    optionsWeekday
  ).format(date);
  //const weekday: string = 'mercredi';

  const optionsDay: Intl.DateTimeFormatOptions = { day: 'numeric' };
  const day: string = new Intl.DateTimeFormat('fr-FR', optionsDay).format(date);
  //const day: string = '22';

  const optionsMonth: Intl.DateTimeFormatOptions = { month: 'long' };
  const month: string = new Intl.DateTimeFormat('fr-FR', optionsMonth).format(
    date
  );
  //const month: string = 'septembre';

  const dayMonth = `${day} ${month}`;

  const year: number = date.getFullYear();

  const style: CSSProperties = {
    textAlign: 'center',
    lineHeight: 1.1,
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const widthFactor: number = displayYear ? 0.1 : 0.145;
  const heightFactor: number = displayWeekDay ? 0.42 : 0.75;

  return (
    <div style={style} ref={ref}>
      <TextFit
        widthFactor={widthFactor}
        heightFactor={heightFactor}
        refParent={ref}
      >
        {displayWeekDay && (
          <>
            {weekday}
            <br />
          </>
        )}
        <div className="text-nowrap">
          {dayMonth} {displayYear && year}
        </div>
      </TextFit>
    </div>
  );
}
