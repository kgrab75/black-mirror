'use client';
import 'regenerator-runtime/runtime';

import { useState } from 'react';
import { useSpeechRecognition } from 'react-speech-recognition';

export default function Grid({}) {
  const [displayGrid, setDisplayGrid] = useState(true);
  const [displayCoordinate, setDisplayCoordinate] = useState(true);

  useSpeechRecognition({
    commands: [
      {
        command: ['Affiche la grille', 'Montre la grille'],
        callback: () => setDisplayGrid(true),
      },
      {
        command: [
          "N'affiche pas la grille",
          'Ne montre pas la grille',
          'Cache la grille',
        ],
        callback: () => setDisplayGrid(false),
      },
      {
        command: ['Affiche les coordonnées', 'Montre les coordonnées'],
        callback: () => setDisplayCoordinate(true),
      },
      {
        command: [
          "N'affiche pas les coordonnées",
          'Ne montre pas les coordonnées',
          'Cache les coordonnées',
        ],
        callback: () => setDisplayCoordinate(false),
      },
    ],
  });

  const size = 12;
  let coordonates = [];
  for (let posX = 1; posX <= size; posX++) {
    for (let posY = 1; posY <= size; posY++) {
      coordonates.push(`${posY};${posX}`);
    }
  }
  return (
    displayGrid && (
      <div className="grid-container">
        {coordonates.map((coordonate) => {
          return (
            <div key={coordonate} className="mirror-grid">
              {displayCoordinate && coordonate}
            </div>
          );
        })}
      </div>
    )
  );
}
