import { differenceInWeeks, isMatch, parse, startOfWeek } from "date-fns";
import { fr } from "date-fns/locale";

export const date2String = (date: Date) => date.toISOString().split('T')[0];

export const dateFromYearMonth = (year: number, month: number) => new Date(`${year}-${month + 1}-1`);

export const date2Day = (date: Date | string) => (typeof date === "string" ? new Date(date) : date).toLocaleDateString('default', {
  weekday: 'short',
  day: '2-digit',
});

export const date2Month = (date: Date | string) => (typeof date === "string" ? new Date(date) : date).toLocaleString('default', {
  month: 'long',
  year: 'numeric',
});

export const date2Time = (date: Date) => date.toLocaleString('default', {
  hour: 'numeric',
  minute: 'numeric',
});

export const date2UnixEpoch = (date: Date) => `${Math.floor(new Date(date2String(date)).getTime() / 1000)}`;


export const parseDate = (dateString: string) => {
  const today = new Date();

  let formats = [
    'dd',                   // 21 (current month)
    'EEEE dd MMMM',         // wednesday 23 october
    'dd MMMM',              // 21 october
    'do MMMM',              // 1st september
    'EEEE dd MMMM yyyy',    // wednesday 23 october 2024
    'dd MMMM yyyy',         // 21 october 2024
    'do MMMM yyyy',         // 1st september 2024
  ];
  let nbLoop = 0;
  for (let formatStr of formats) {
    nbLoop++;
    try {

      if (isMatch(dateString, formatStr, { locale: fr })) {
        return parse(dateString, formatStr, today, {
          locale: fr
        });
      }
    } catch (error) {
      // Ignorer l'erreur et essayer le format suivant
    }
  }

  throw new Error('Le format de la date n\'est pas reconnu.');
};

export const weeksBetween = (futureDate: Date) => {
  const firstDayOfCurrentWeek = startOfWeek(new Date(), { locale: fr });

  // Calculer la différence en semaines
  const weeksDifference = differenceInWeeks(futureDate, firstDayOfCurrentWeek);
  return weeksDifference;
};