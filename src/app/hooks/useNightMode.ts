import { useState, useEffect } from 'react';

const isWithinTimeRange = (startTime: Date, endTime: Date) => {
  const extractTime = (date: Date) => {
    return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
  };
  const now = new Date();

  const startInSeconds = extractTime(startTime);
  const endInSeconds = extractTime(endTime);
  const nowInSeconds = extractTime(now);

  if (startInSeconds <= endInSeconds) {
    return nowInSeconds >= startInSeconds && nowInSeconds <= endInSeconds;
  } else {
    return nowInSeconds >= startInSeconds || nowInSeconds <= endInSeconds;
  }
};

const useNightMode = (startHour = '00:00:00', endHour = '06:00:00') => {
  const timeStringToDate = (time: string) => {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, seconds);
  };

  const startTime = timeStringToDate(startHour);
  const endTime = timeStringToDate(endHour);

  const isNightTime = () => {
    return isWithinTimeRange(startTime, endTime);
  };

  const [nightMode, setNightMode] = useState(isNightTime);
  const [manualOverride, setManualOverride] = useState(false);

  useEffect(() => {
    if (!manualOverride) {
      const interval = setInterval(() => {
        const currentNightMode = isNightTime();
        setNightMode(currentNightMode);
      }, 60000);

      return () => clearInterval(interval);
    } else {
      const interval = setInterval(() => {
        resetToAuto();
      }, 60 * 2 * 1000);

      return () => clearInterval(interval);
    }
  }, [manualOverride]);

  const resetToAuto = () => {
    setManualOverride(false);
    setNightMode(isNightTime());
  };

  return { nightMode, setNightMode, setManualOverride };
};

export default useNightMode;
