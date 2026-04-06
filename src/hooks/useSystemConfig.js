import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_SYSTEM_CONFIG,
  buildPresetConfig,
  loadSystemConfig,
  saveSystemConfig,
} from '../utils/systemConfigStorage';

export default function useSystemConfig() {
  const [config, setConfig] = useState(loadSystemConfig);

  useEffect(() => {
    saveSystemConfig(config);
  }, [config]);

  const updateConfig = useCallback((partial) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  const setThickness = useCallback((v) => updateConfig({ thickness: v }), [updateConfig]);
  const setSpeed = useCallback((v) => updateConfig({ speed: v }), [updateConfig]);
  const setPrecipType = useCallback((v) => updateConfig({ precipType: v }), [updateConfig]);
  const setDensity = useCallback((v) => updateConfig({ density: v }), [updateConfig]);
  const setWind = useCallback((v) => updateConfig({ wind: v }), [updateConfig]);
  const setDropLength = useCallback((v) => updateConfig({ dropLength: v }), [updateConfig]);
  const setTurbulence = useCallback((v) => updateConfig({ turbulence: v }), [updateConfig]);

  const applyPreset = useCallback((presetId) => {
    setConfig(buildPresetConfig(presetId));
  }, []);

  const resetToDefaults = useCallback(() => {
    setConfig({ ...DEFAULT_SYSTEM_CONFIG });
  }, []);

  const applyEmergency = useCallback(() => {
    setConfig({
      ...DEFAULT_SYSTEM_CONFIG,
      thickness: 0.55,
      speed: 0.55,
      precipType: 'rain',
      density: 90,
      wind: 0.2,
      dropLength: 10,
      turbulence: 0.08,
    });
  }, []);

  const persistNow = useCallback(() => {
    saveSystemConfig(config);
  }, [config]);

  return {
    ...config,
    updateConfig,
    setThickness,
    setSpeed,
    setPrecipType,
    setDensity,
    setWind,
    setDropLength,
    setTurbulence,
    applyPreset,
    resetToDefaults,
    applyEmergency,
    persistNow,
  };
}
