import React, { useEffect, useState } from 'react';

interface LoadingBarProps {
  duration: number; // Le temps en secondes pendant lequel la barre doit se décharger
}

const LoadingBar: React.FC<LoadingBarProps> = ({ duration }) => {
  const [progress, setProgress] = useState<number>(100); // Départ à 100% (plein)

  useEffect(() => {
    const startTime = Date.now(); // Enregistre le temps de démarrage
    const totalDuration = duration * 1000; // Convertit la durée en millisecondes

    const updateProgress = () => {
      const elapsedTime = Date.now() - startTime; // Calcule le temps écoulé
      const percentage = 100 - (elapsedTime / totalDuration) * 100; // Inverse la progression
      setProgress(Math.max(percentage, 0)); // Assure que la progression n'est pas inférieure à 0%
    };

    const interval = setInterval(updateProgress, 16); // Mettez à jour toutes les ~16ms (~60fps)

    return () => clearInterval(interval); // Nettoie l'intervalle lorsque le composant se démonte
  }, [duration]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '8px',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: `${progress}%`,
          height: '100%',
          backgroundColor: '#008fffcc', // Une couleur rouge pour illustrer un déchargement
          transition: 'width 0.016s linear', // Transition fluide pour chaque mise à jour
        }}
      />
    </div>
  );
};

export default LoadingBar;
