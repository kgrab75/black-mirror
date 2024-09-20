import { differenceInWeeks, isMatch, parse, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

export const date2String = (date: Date) => date.toISOString().split('T')[0];

export const dateFromYearMonth = (year: number, month: number) =>
  new Date(`${year}-${month + 1}-1`);

export const date2Day = (date: Date | string) =>
  (typeof date === 'string' ? new Date(date) : date).toLocaleDateString(
    'default',
    {
      weekday: 'short',
      day: '2-digit',
    },
  );

export const date2Month = (date: Date | string) =>
  (typeof date === 'string' ? new Date(date) : date).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

export const date2Time = (date: Date) =>
  date.toLocaleString('default', {
    hour: 'numeric',
    minute: 'numeric',
  });

export const date2UnixEpoch = (date: Date) =>
  `${Math.floor(new Date(date2String(date)).getTime() / 1000)}`;

export const parseDate = (dateString: string) => {
  const today = new Date();

  let formats = [
    'dd', // 21 (current month)
    'EEEE dd MMMM', // wednesday 23 october
    'dd MMMM', // 21 october
    'do MMMM', // 1st september
    'EEEE dd MMMM yyyy', // wednesday 23 october 2024
    'dd MMMM yyyy', // 21 october 2024
    'do MMMM yyyy', // 1st september 2024
  ];
  let nbLoop = 0;
  for (let formatStr of formats) {
    nbLoop++;
    try {
      if (isMatch(dateString, formatStr, { locale: fr })) {
        return parse(dateString, formatStr, today, {
          locale: fr,
        });
      }
    } catch (error) {
      // Ignorer l'erreur et essayer le format suivant
    }
  }

  throw new Error("Le format de la date n'est pas reconnu.");
};

export const weeksBetween = (futureDate: Date) => {
  const firstDayOfCurrentWeek = startOfWeek(new Date(), { locale: fr });

  // Calculer la différence en semaines
  const weeksDifference = differenceInWeeks(futureDate, firstDayOfCurrentWeek);
  return weeksDifference;
};

export function convertToSeconds(duration: string): number | null {
  const timeRegex = /(\d+)\s*(secondes?|minutes?|heures?)?/gi;
  const matches = [...duration.matchAll(timeRegex)];

  if (matches.length === 0) {
    return null; // Retourne null si le format n'est pas reconnu
  }

  let totalSeconds = 0;
  let previousUnit = ''; // Pour suivre l'unité précédente

  for (const match of matches) {
    const value = parseInt(match[1], 10);
    const unit = match[2] ? match[2].toLowerCase() : null; // Récupère l'unité ou null si absente

    if (unit === null) {
      // Si aucune unité n'est spécifiée, on fait une supposition basée sur l'unité précédente
      if (previousUnit === 'minute' || previousUnit === 'minutes') {
        totalSeconds += value; // Supposons que c'est des secondes
      } else if (previousUnit === 'heure' || previousUnit === 'heures') {
        totalSeconds += value * 60; // Supposons que c'est des minutes
      } else {
        return null; // Si aucune unité précédente n'existe, la chaîne n'est pas valide
      }
    } else {
      switch (unit) {
        case 'seconde':
        case 'secondes':
          totalSeconds += value;
          break;
        case 'minute':
        case 'minutes':
          totalSeconds += value * 60;
          previousUnit = 'minutes'; // Garde une trace pour la prochaine valeur implicite
          break;
        case 'heure':
        case 'heures':
          totalSeconds += value * 3600;
          previousUnit = 'heures'; // Garde une trace pour la prochaine valeur implicite
          break;
        default:
          return null; // Retourne null si l'unité n'est pas reconnue
      }
    }
  }

  return totalSeconds;
}
