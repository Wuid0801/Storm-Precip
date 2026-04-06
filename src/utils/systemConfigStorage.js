export const SYSTEM_CONFIG_STORAGE_KEY = 'rain-system-config-v1';

export const DEFAULT_SYSTEM_CONFIG = {
  thickness: 1,
  speed: 1,
  precipType: 'rain',
  density: 220,
  wind: 1,
  dropLength: 22,
  turbulence: 0.35,
};

/** Preset id → partial config merged onto defaults */
export const SYSTEM_CONFIG_PRESETS = {
  lightRain: {
    thickness: 0.65,
    speed: 0.75,
    precipType: 'rain',
    density: 120,
    wind: 0.35,
    dropLength: 14,
    turbulence: 0.12,
  },
  heavyStorm: {
    thickness: 1.65,
    speed: 1.55,
    precipType: 'rain',
    density: 420,
    wind: 1.65,
    dropLength: 32,
    turbulence: 0.62,
  },
  snowMode: {
    thickness: 1.1,
    speed: 0.85,
    precipType: 'snow',
    density: 280,
    wind: 0.55,
    dropLength: 12,
    turbulence: 0.22,
  },
  extreme: {
    thickness: 2,
    speed: 2,
    precipType: 'rain',
    density: 500,
    wind: 2,
    dropLength: 40,
    turbulence: 1,
  },
  drizzle: {
    thickness: 0.55,
    speed: 0.62,
    precipType: 'rain',
    density: 95,
    wind: 0.12,
    dropLength: 9,
    turbulence: 0.06,
  },
  sleet: {
    thickness: 1.18,
    speed: 1.08,
    precipType: 'sleet',
    density: 255,
    wind: 0.88,
    dropLength: 17,
    turbulence: 0.3,
  },
  monsoon: {
    thickness: 1.48,
    speed: 1.38,
    precipType: 'rain',
    density: 465,
    wind: 1.22,
    dropLength: 30,
    turbulence: 0.48,
  },
  calmClear: {
    thickness: 0.82,
    speed: 0.68,
    precipType: 'rain',
    density: 155,
    wind: 0.22,
    dropLength: 15,
    turbulence: 0.09,
  },
};

const PRECIP_TYPES = new Set(['rain', 'sleet', 'snow']);

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function normalizeSystemConfig(raw) {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_SYSTEM_CONFIG };
  }

  const pt = PRECIP_TYPES.has(raw.precipType) ? raw.precipType : DEFAULT_SYSTEM_CONFIG.precipType;

  return {
    thickness: clamp(Number(raw.thickness) || DEFAULT_SYSTEM_CONFIG.thickness, 0.5, 2),
    speed: clamp(Number(raw.speed) || DEFAULT_SYSTEM_CONFIG.speed, 0.5, 2),
    precipType: pt,
    density: clamp(Math.round(Number(raw.density)) || DEFAULT_SYSTEM_CONFIG.density, 50, 500),
    wind: clamp(Number(raw.wind) || DEFAULT_SYSTEM_CONFIG.wind, 0, 2),
    dropLength: clamp(Math.round(Number(raw.dropLength)) || DEFAULT_SYSTEM_CONFIG.dropLength, 5, 40),
    turbulence: clamp(Number(raw.turbulence) || DEFAULT_SYSTEM_CONFIG.turbulence, 0, 1),
  };
}

export function loadSystemConfig() {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_SYSTEM_CONFIG };
  }

  try {
    const stored = window.localStorage.getItem(SYSTEM_CONFIG_STORAGE_KEY);
    if (!stored) return { ...DEFAULT_SYSTEM_CONFIG };
    const parsed = JSON.parse(stored);
    return normalizeSystemConfig(parsed);
  } catch {
    return { ...DEFAULT_SYSTEM_CONFIG };
  }
}

export function saveSystemConfig(config) {
  if (typeof window === 'undefined') return;
  try {
    const normalized = normalizeSystemConfig(config);
    window.localStorage.setItem(SYSTEM_CONFIG_STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    // ignore quota / private mode
  }
}

export function buildPresetConfig(presetId) {
  const preset = SYSTEM_CONFIG_PRESETS[presetId];
  if (!preset) return { ...DEFAULT_SYSTEM_CONFIG };
  return normalizeSystemConfig({ ...DEFAULT_SYSTEM_CONFIG, ...preset });
}
