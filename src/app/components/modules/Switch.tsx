'use client';

import TextFit from '@/app/components/TextFit';
import { ModuleProps } from '@/app/lib/definitions';
import styles from '@/app/styles/Switch.module.css';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRef, useState } from 'react';
import { useSpeechRecognition } from 'react-speech-recognition';

export default function Switch(props: ModuleProps) {
  const ref = useRef(null);
  const [lightState, setLightState] = useState('off');
  const [animate, setAnimate] = useState(false);

  useSpeechRecognition({
    commands: [
      {
        command: [
          'Allume la lumière du *',
          'Allume la lumière de la *',
          'Allume la lumière des *',
          'Allume les lumières du *',
          'Allume les lumières de la *',
          'Allume les lumières des *',
        ],
        callback: (room) => {
          handleLightToggle('on', room);
        },
      },
      {
        command: [
          'éteins la lumière du *',
          'éteins la lumière de la *',
          'éteins la lumière des *',
          'éteins les lumières du *',
          'éteins les lumières de la *',
          'éteins les lumières des *',
        ],
        callback: (room) => {
          handleLightToggle('off', room);
        },
      },
      {
        command: [
          'éteins toutes les lumières',
          'éteins les lumières',
          'Au revoir',
        ],
        callback: () => {
          handleLightToggle('off', 'all');
        },
      },
      {
        command: ['Allume toutes les lumières'],
        callback: () => {
          handleLightToggle('on', 'all');
        },
      },
    ],
  });

  const handleLightToggle = async (newState: 'on' | 'off', room: string) => {
    try {
      const response = await fetch(
        `/api/light?state=${newState}&room=${room}`,
        {
          method: 'GET',
        }
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
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  return (
    <div className="px-2 h-full">
      <div className="w-full h-full flex items-center justify-center">
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
