import { useMemo } from 'react';
import { useEnvironmentData } from './useEnvironmentData';

export function useSpectrumData() {
  const { environmentData, isLoading, isError } = useEnvironmentData();

  const parsed = useMemo(() => {
    const intensity = parseFloat(environmentData.intensity) || 0;
    const windMatch = environmentData.windVector.match(/([0-9.]+)\s*m\/s/i);
    const windSpeed = windMatch ? parseFloat(windMatch[1]) : 0;

    return {
      intensity,
      windSpeed,
      atmosphereType: environmentData.atmosphereType,
      raw: environmentData,
    };
  }, [environmentData]);

  return {
    spectrumData: parsed,
    isLoading,
    isError,
  };
}