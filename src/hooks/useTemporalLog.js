import { useEffect, useState } from 'react';

function pad(value, size = 2) {
  return String(value).padStart(size, '0');
}

function formatTemporalLog(date) {
  return [
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
    pad(Math.floor(date.getMilliseconds() / 10)),
  ].join(':');
}

export function useTemporalLog() {
  const [time, setTime] = useState(() => formatTemporalLog(new Date()));

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTime(formatTemporalLog(new Date()));
    }, 50);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return time;
}
