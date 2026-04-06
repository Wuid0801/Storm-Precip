const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

function buildWeatherUrl({ latitude, longitude }) {
  const search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'precipitation',
      'rain',
      'showers',
      'snowfall',
      'cloud_cover',
      'wind_speed_10m',
      'wind_direction_10m',
    ].join(','),
    temperature_unit: 'celsius',
    wind_speed_unit: 'ms',
    precipitation_unit: 'mm',
    forecast_days: '1',
  });

  return `${OPEN_METEO_BASE_URL}?${search.toString()}`;
}

export async function fetchWeatherData({ latitude, longitude, signal }) {
  const response = await fetch(buildWeatherUrl({ latitude, longitude }), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Weather API request failed with status ${response.status}`);
  }

  return response.json();
}

export async function fetchWeatherByCoordinates({ latitude, longitude, signal }) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'precipitation',
      'rain',
      'snowfall',
      'cloud_cover',
      'wind_speed_10m',
      'wind_direction_10m',
    ].join(','),
    timezone: 'auto',
    forecast_days: '1',
  });

  const response = await fetch(`${OPEN_METEO_BASE_URL}?${params.toString()}`, {
    method: 'GET',
    signal,
  });

  if (!response.ok) {
    throw new Error(`Weather API failed: ${response.status}`);
  }

  return response.json();
}