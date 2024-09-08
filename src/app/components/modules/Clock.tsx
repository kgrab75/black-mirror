'use client';

import TextFit from '@/app/components/TextFit';
import useNotification from '@/app/hooks/useNotification';
import { ModuleProps } from '@/app/lib/definitions';
import { CSSProperties, useEffect, useRef, useState } from 'react';
import { useSpeechRecognition } from 'react-speech-recognition';

function useTime(): Date {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}

export default function Clock(props: ModuleProps) {
  const ref = useRef(null);
  const time: Date = useTime();
  const [displaySecond, setDisplaySecond] = useState(false);
  const { showNotification } = useNotification();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useSpeechRecognition({
    commands: [
      {
        command: ['Affiche les secondes', 'Montre les secondes'],
        callback: () => {
          setDisplaySecond(true);
          showNotification("J'ai affiché les secondes");
        },
      },
      {
        command: [
          "N'affiche pas les secondes",
          'Ne montre pas les secondes',
          'Cache les secondes',
        ],
        callback: () => setDisplaySecond(false),
      },
      {
        command: 'Reset',
        callback: ({ resetTranscript }) => resetTranscript(),
      },
    ],
  });

  const options: Intl.DateTimeFormatOptions = displaySecond
    ? {}
    : { timeStyle: 'short' };

  const style: CSSProperties = {
    textAlign: 'center',
    fontFamily: 'monospace',
    lineHeight: 1,
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const widthFactor = displaySecond ? 0.22 : 0.35;
  const heightFactor = displaySecond ? 0.975 : 1.3;

  return (
    <div style={style} ref={ref}>
      {isHydrated && (
        <TextFit
          {...props}
          widthFactor={widthFactor}
          heightFactor={heightFactor}
          refParent={ref}
        >
          {time.toLocaleTimeString(process.env.LOCALE, options)}
        </TextFit>
      )}
    </div>
  );
}
