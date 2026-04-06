import { useEffect, useMemo, useState } from 'react';
import { fetchWeatherByCoordinates } from '../services/weatherService';
import { mapWeatherToEnvironment } from '../utils/mapWeatherToEnvironment';
import { useCurrentLocation } from './useCurrentLocation';

const FALLBACK_ENVIRONMENT = {
  intensity: '—',
  windVector: '—',
  atmosphereType: 'STANDBY / UNKNOWN',
  latitude: '—',
  longitude: '—',
};

const POLLING_INTERVAL = 5 * 60 * 1000;

export function useEnvironmentData() {
  const { coords, isLocating, locationError, hasFallbackLocation } = useCurrentLocation();

  const [weatherRaw, setWeatherRaw] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!coords?.latitude || !coords?.longitude) return;

    let cancelled = false;
    let abortController = null;
    let intervalId = null;

    const load = async () => {
      abortController?.abort();
      abortController = new AbortController();

      try {
        if (!cancelled && weatherRaw === null) {
          setIsLoading(true);
        }

        const result = await fetchWeatherByCoordinates({
          latitude: coords.latitude,
          longitude: coords.longitude,
          signal: abortController.signal,
        });

        if (cancelled) return;

        setWeatherRaw(result);
        setIsError(false);
      } catch (error) {
        if (cancelled || error.name === 'AbortError') return;
        setIsError(true);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();
    intervalId = window.setInterval(load, POLLING_INTERVAL);

    return () => {
      cancelled = true;
      abortController?.abort();
      window.clearInterval(intervalId);
    };
  }, [coords?.latitude, coords?.longitude]);

  const environmentData = useMemo(() => {
    if (!coords?.latitude || !coords?.longitude) return FALLBACK_ENVIRONMENT;
    if (!weatherRaw) {
      return {
        ...FALLBACK_ENVIRONMENT,
        latitude: `${Math.abs(coords.latitude).toFixed(4)}° ${coords.latitude >= 0 ? 'N' : 'S'}`,
        longitude: `${Math.abs(coords.longitude).toFixed(4)}° ${coords.longitude >= 0 ? 'E' : 'W'}`,
      };
    }

    return mapWeatherToEnvironment(weatherRaw, coords);
  }, [weatherRaw, coords]);

  return {
    environmentData,
    isLoading: isLoading || isLocating,
    isError,
    locationError,
    hasFallbackLocation,
  };
}