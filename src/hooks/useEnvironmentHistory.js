import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEnvironmentData } from './useEnvironmentData';

const STORAGE_KEY = 'rain-monitor-history-v1';
const MAX_HISTORY = 72;
const MIN_APPEND_INTERVAL = 60 * 1000;

function pad(value, size = 2) {
  return String(value).padStart(size, '0');
}

function formatLogTimestamp(dateValue) {
  const date = new Date(dateValue);

  return [
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
    pad(Math.floor(date.getMilliseconds() / 10)),
  ].join(':');
}

function parseWindValue(windVector) {
  const match = String(windVector || '').match(/([A-Z]+)\s+([\d.]+)\s*m\/s/i);

  if (!match) {
    return { direction: '—', speed: 0 };
  }

  return {
    direction: match[1].toUpperCase(),
    speed: Number(match[2]) || 0,
  };
}

function parseIntensityValue(intensity) {
  const match = String(intensity || '').match(/([\d.]+)/);
  return match ? Number(match[1]) || 0 : 0;
}

function safeReadHistory() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWriteHistory(nextHistory) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
  } catch {
    // ignore storage write failures
  }
}

function isMeaningfullyDifferent(currentEnvironment, previousEnvironment) {
  if (!previousEnvironment) return true;

  const currentIntensity = parseIntensityValue(currentEnvironment.intensity);
  const previousIntensity = parseIntensityValue(previousEnvironment.intensity);

  const currentWind = parseWindValue(currentEnvironment.windVector);
  const previousWind = parseWindValue(previousEnvironment.windVector);

  const intensityDiff = Math.abs(currentIntensity - previousIntensity);
  const windSpeedDiff = Math.abs(currentWind.speed - previousWind.speed);
  const windDirectionChanged = currentWind.direction !== previousWind.direction;
  const atmosphereChanged =
    currentEnvironment.atmosphereType !== previousEnvironment.atmosphereType;
  const locationChanged =
    currentEnvironment.latitude !== previousEnvironment.latitude ||
    currentEnvironment.longitude !== previousEnvironment.longitude;

  return (
    intensityDiff >= 0.3 ||
    windSpeedDiff >= 0.8 ||
    windDirectionChanged ||
    atmosphereChanged ||
    locationChanged
  );
}

function buildHistoryMeta(currentEnvironment, previousEnvironment) {
  if (!previousEnvironment) {
    return {
      label: 'INITIAL ENVIRONMENT SNAPSHOT',
      value: currentEnvironment.intensity,
      marker: 'init',
    };
  }

  const currentIntensity = parseIntensityValue(currentEnvironment.intensity);
  const previousIntensity = parseIntensityValue(previousEnvironment.intensity);
  const intensityDelta = currentIntensity - previousIntensity;

  const currentWind = parseWindValue(currentEnvironment.windVector);
  const previousWind = parseWindValue(previousEnvironment.windVector);

  if (Math.abs(intensityDelta) >= 3) {
    return {
      label:
        intensityDelta > 0
          ? 'PRECIPITATION SPIKE DETECTED'
          : 'PRECIPITATION DROP DETECTED',
      value: `${currentIntensity.toFixed(1)} mm/h`,
      marker: intensityDelta > 0 ? 'spike' : 'drop',
    };
  }

  if (currentWind.direction !== previousWind.direction) {
    return {
      label: `WIND VECTOR SHIFT: ${previousWind.direction} → ${currentWind.direction}`,
      value: currentEnvironment.windVector,
      marker: 'shift',
    };
  }

  if (Math.abs(currentWind.speed - previousWind.speed) >= 2) {
    return {
      label: 'WIND SPEED VARIATION DETECTED',
      value: currentEnvironment.windVector,
      marker: 'wind',
    };
  }

  if (currentEnvironment.atmosphereType !== previousEnvironment.atmosphereType) {
    return {
      label: 'ATMOSPHERIC STATE TRANSITION',
      value: currentEnvironment.atmosphereType,
      marker: 'transition',
    };
  }

  return {
    label: 'ENVIRONMENT STATE RECORDED',
    value: currentEnvironment.intensity,
    marker: 'state',
  };
}

export function useEnvironmentHistory() {
  const {
    environmentData,
    isLoading,
    isError,
    locationError,
    hasFallbackLocation,
  } = useEnvironmentData();

  const [history, setHistory] = useState([]);
  const initializedRef = useRef(false);
  const lastSavedAtRef = useRef(0);

  useEffect(() => {
    const savedHistory = safeReadHistory();
    setHistory(savedHistory);

    if (savedHistory.length > 0) {
      lastSavedAtRef.current =
        savedHistory[savedHistory.length - 1]?.recordedAt || 0;
    }

    initializedRef.current = true;
  }, []);

  useEffect(() => {
    if (!initializedRef.current) return;
    if (isLoading || isError) return;
    if (!environmentData) return;
    if (environmentData.intensity === '—') return;

    const now = Date.now();

    setHistory((prevHistory) => {
      const lastEntry = prevHistory[prevHistory.length - 1];
      const previousEnvironment = lastEntry?.environmentData ?? null;

      const isFirstEntry = !lastEntry;
      const passedInterval = now - lastSavedAtRef.current >= MIN_APPEND_INTERVAL;
      const changedEnough = isMeaningfullyDifferent(
        environmentData,
        previousEnvironment,
      );

      if (!isFirstEntry && !passedInterval && !changedEnough) {
        return prevHistory;
      }

      if (!isFirstEntry && !passedInterval) {
        return prevHistory;
      }

      const meta = buildHistoryMeta(environmentData, previousEnvironment);

      const nextEntry = {
        id: `${now}-${prevHistory.length}`,
        recordedAt: now,
        timestamp: formatLogTimestamp(now),
        label: meta.label,
        value: meta.value,
        marker: meta.marker,
        environmentData: {
          ...environmentData,
        },
      };

      const nextHistory = [...prevHistory, nextEntry].slice(-MAX_HISTORY);

      safeWriteHistory(nextHistory);
      lastSavedAtRef.current = now;

      return nextHistory;
    });
  }, [environmentData, isLoading, isError]);

  const captureManualSnapshot = useCallback(() => {
    if (!initializedRef.current) return;
    if (isLoading || isError) return;
    if (!environmentData || environmentData.intensity === '—') return;

    const now = Date.now();

    setHistory((prevHistory) => {
      const nextEntry = {
        id: `${now}-manual-${prevHistory.length}`,
        recordedAt: now,
        timestamp: formatLogTimestamp(now),
        label: 'MANUAL CAPTURE',
        value: environmentData.intensity,
        marker: 'manual',
        environmentData: {
          ...environmentData,
        },
      };

      const nextHistory = [...prevHistory, nextEntry].slice(-MAX_HISTORY);

      safeWriteHistory(nextHistory);
      lastSavedAtRef.current = now;

      return nextHistory;
    });
  }, [environmentData, isLoading, isError]);

  const entries = useMemo(() => {
    if (!history.length) return [];

    const chronological = history.map((entry, index, array) => ({
      ...entry,
      point: array.length === 1 ? 0.5 : index / (array.length - 1),
    }));

    // 목록은 최신이 위로 오도록 역순 (타임라인 point는 과거→미래 축 유지)
    return chronological.slice().reverse();
  }, [history]);

  return {
    entries,
    environmentData,
    isLoading,
    isError,
    locationError,
    hasFallbackLocation,
    captureManualSnapshot,
  };
}