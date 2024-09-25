'use client';

import Loader from '@/app/components/Loader';
import TextFit from '@/app/components/TextFit';
import { ModuleProps } from '@/app/lib/definitions';
import type { Mode, StopSchedule } from '@kgrab75/stop-watcher';
import { StopWatcher } from '@kgrab75/stop-watcher';
import { useEffect, useRef, useState } from 'react';
import { useSpeechRecognition } from 'react-speech-recognition';
import Stop from './stopWatcher/Stop';

const apiKey = process.env.NEXT_PUBLIC_PRIM_API_KEY || '';
const stopWatcher = new StopWatcher({
  apiKey,
  asDate: true,
});

const capitalize = <T extends string>(s: T) =>
  (s[0].toUpperCase() + s.slice(1)) as Capitalize<typeof s>;

export default function StopWathcer(props: ModuleProps) {
  const ref = useRef(null);
  const [stopSchedules, setStopSchedules] = useState<StopSchedule[]>([]);
  const [stop, setStop] = useState('Michel Bizot');
  const [mode, setMode] = useState<Mode | null>(StopWatcher.MODE.METRO);
  const [line, setLine] = useState<string | null>('8');
  const [loading, setLoading] = useState(true);

  useSpeechRecognition({
    commands: [
      {
        command: ['Prochain passage à *'],
        callback: (stop) => {
          setStop(stop);
          setMode(null);
          setLine(null);
        },
      },
      {
        command: ['Prochain passage à * sur la ligne *'],
        callback: (stop, line) => {
          setStop(stop);
          setMode(null);
          setLine(capitalize(line));
        },
      },
      {
        command: [
          'Prochain passage à * en métro',
          'Prochain passage (du)(de)(des) métro à *',
        ],
        callback: (stop) => {
          setStop(stop);
          setMode(StopWatcher.MODE.METRO);
          setLine(null);
        },
      },
      {
        command: [
          'Prochain passage à * en bus',
          'Prochain passage (du)(de)(des) bus à *',
        ],
        callback: (stop) => {
          setStop(stop);
          setMode(StopWatcher.MODE.BUS);
          setLine(null);
        },
      },
      {
        command: [
          'Prochain passage à * en tram',
          'Prochain passage (du)(de)(des) tram à *',
        ],
        callback: (stop) => {
          setStop(stop);
          setMode(StopWatcher.MODE.TRAM);
          setLine(null);
        },
      },
      {
        command: ['Prochain passage (du)(de)(des) métro * à *'],
        callback: (line, stop) => {
          setStop(stop);
          setMode(StopWatcher.MODE.METRO);
          setLine(capitalize(line));
        },
      },
      {
        command: ['Prochain passage (du)(de)(des) bus * à *'],
        callback: (line, stop) => {
          setStop(stop);
          setMode(StopWatcher.MODE.BUS);
          setLine(capitalize(line));
        },
      },
      {
        command: ['Prochain passage (du)(de)(des) tram * à *'],
        callback: (line, stop) => {
          setStop(stop);
          setMode(StopWatcher.MODE.TRAM);
          setLine(capitalize(line));
        },
      },
    ],
  });

  useEffect(() => {
    const updateStopSchedules = async (displayLoading: boolean) => {
      displayLoading && setLoading(true);

      setStopSchedules(await stopWatcher.getStopSchedules(stop, mode, line));
      setLoading(false);
    };
    updateStopSchedules(true);
    const interval = setInterval(
      () => updateStopSchedules(false),
      1 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [stop, mode, line]);

  return (
    <div className="h-full" ref={ref}>
      {loading ? (
        <Loader />
      ) : (
        <TextFit widthFactor={0.1} heightFactor={0.1} refParent={ref}>
          {stopSchedules.length === 0 ? (
            <div>
              {`Aucune station "${stop}" trouvée sur la ligne "${line}"`}
            </div>
          ) : (
            stopSchedules.map((stopSchedule, index) => (
              <Stop key={index} stopSchedule={stopSchedule} />
            ))
          )}
        </TextFit>
      )}
    </div>
  );
}
