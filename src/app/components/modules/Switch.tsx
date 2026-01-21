'use client';

import TextFit from '@/app/components/TextFit';
import { ModuleProps } from '@/app/lib/definitions';
import styles from '@/app/styles/Switch.module.css';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRef, useState } from 'react';
import { useSpeechRecognition } from 'react-speech-recognition';
import Loader from '../Loader';

export default function Switch(props: ModuleProps) {
  const ref = useRef(null);
  const [loading, setLoading] = useState(false);
  const [lightState, setLightState] = useState('off');
  const [animate, setAnimate] = useState(false);

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const ROOM_VARIANTS: Array<[string, string]> = [
    ['salle de bains', 'salle de bain'],
    ['salle de bain', 'salle de bain'],
    ['sdb', 'salle de bain'],
    ['toilettes', 'toilettes'],
    ['wc', 'toilettes'],
    ['bureau', 'bureau'],
    ['chambre', 'chambre'],
    ['cuisine', 'cuisine'],
    ['salon', 'salon'],
  ];

  const findRoom = (raw: string): string | null => {
    const s = normalize(raw);
    for (const [v, room] of ROOM_VARIANTS) if (s.includes(v)) return room;
    return null;
  };

  const isAll = (raw: string) => {
    const s = normalize(raw);
    return s.includes('toutes') || s.includes('tout');
  };

  const ON = new Set(['allume', 'allumer', 'mets', 'met', 'active', 'activer']);
  const CMD =
    /(?:^|.*?[\s,;:.!?])(allume|allumer|mets|met|active|activer|eteins|éteins|eteindre|éteindre|coupe|couper|desactive|désactive|desactiver|désactiver|arrete|arrête|stop|au revoir)\s*(.*)$/i;

  useSpeechRecognition({
    commands: [
      {
        command: CMD,
        callback: (verb: string, tail: string, meta: any) => {
          const v = normalize(verb);

          if (v === 'au revoir') {
            meta?.resetTranscript?.();
            handleLightToggle('off', 'all');
            return;
          }

          const room = findRoom(tail) ?? (isAll(tail) ? 'all' : null);
          if (!room) return;

          const state: 'on' | 'off' = ON.has(v) ? 'on' : 'off';
          meta?.resetTranscript?.();
          handleLightToggle(state, room);
        },
      },
    ],
  });

  const handleLightToggle = async (newState: 'on' | 'off', room: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/light?state=${newState}&room=${room}`,
        {
          method: 'GET',
        },
      );

      if (response.ok) {
        setLightState(newState);
        setAnimate(true);
        setTimeout(() => setAnimate(false), 1000);
        console.log(`Light turned ${newState}`);
      } else {
        const errorData = await response.json();
        console.error('Error toggling the light:', errorData.message);
      }
      setLoading(false);
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  return (
    <div className="px-2 h-full">
      <div className="w-full h-full flex items-center justify-center">
        {loading && (
          <div className="opacity-30">
            <Loader />
          </div>
        )}
        <div
          className="flex justify-center items-center flex-col h-full w-full"
          ref={ref}
        >
          <TextFit widthFactor={0.4} heightFactor={0.35} refParent={ref}>
            <div className={styles.icon}>
              <FontAwesomeIcon
                icon={faLightbulb}
                size="2x"
                className={`opacity-50 ${styles.icon} ${
                  animate ? styles.flash : styles.hide
                }`}
                style={{ color: lightState === 'off' ? 'grey' : 'yellow' }}
              />
            </div>
          </TextFit>
        </div>
      </div>
    </div>
  );
}
