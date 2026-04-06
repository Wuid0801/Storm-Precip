import { useEffect, useState } from 'react';
import { getCurrentPosition } from '../services/locationService';

const FALLBACK_COORDS = {
  latitude: 37.5665,
  longitude: 126.9780,
};

export function useCurrentLocation() {
  const [coords, setCoords] = useState(FALLBACK_COORDS);
  const [isLocating, setIsLocating] = useState(true);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function locate() {
      try {
        setIsLocating(true);
        const position = await getCurrentPosition();

        if (cancelled) return;

        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationError(null);
      } catch (error) {
        if (cancelled) return;
        setLocationError(error);
      } finally {
        if (!cancelled) setIsLocating(false);
      }
    }

    locate();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    coords,
    isLocating,
    locationError,
    hasFallbackLocation: Boolean(locationError),
  };
}