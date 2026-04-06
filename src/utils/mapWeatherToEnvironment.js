function formatCoordinate(value, positiveSuffix, negativeSuffix) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—';
  const abs = Math.abs(value).toFixed(4);
  const suffix = value >= 0 ? positiveSuffix : negativeSuffix;
  return `${abs}° ${suffix}`;
}

function toWindDirectionLabel(degrees) {
  if (typeof degrees !== 'number' || Number.isNaN(degrees)) return '—';

  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const normalized = ((degrees % 360) + 360) % 360;
  const index = Math.round(normalized / 45) % 8;
  return directions[index];
}

function deriveAtmosphereType({ temperature, humidity, precipitation, cloudCover }) {
  let thermalBand = 'MILD';

  if (typeof temperature === 'number') {
    if (temperature <= 5) thermalBand = 'COLD';
    else if (temperature <= 16) thermalBand = 'COOL';
    else if (temperature >= 28) thermalBand = 'HOT';
    else thermalBand = 'MILD';
  }

  let moistureBand = 'DRY';

  if (typeof humidity === 'number') {
    if (humidity >= 80 || precipitation > 0.2 || cloudCover >= 80) moistureBand = 'SATURATED';
    else if (humidity >= 55 || cloudCover >= 45) moistureBand = 'HUMID';
    else moistureBand = 'DRY';
  }

  return `${thermalBand} / ${moistureBand}`;
}

export function mapWeatherToEnvironment(apiData, coords) {
  const current = apiData?.current ?? {};

  const precipitation =
    typeof current.rain === 'number' && current.rain > 0
      ? current.rain
      : typeof current.precipitation === 'number'
        ? current.precipitation
        : 0;

  const windSpeed = current.wind_speed_10m;
  const windDirection = current.wind_direction_10m;
  const temperature = current.temperature_2m;
  const humidity = current.relative_humidity_2m;
  const cloudCover = current.cloud_cover;
  const snowfall = current.snowfall;

  let intensity = '—';
  if (typeof precipitation === 'number') {
    intensity = `${precipitation.toFixed(1)} mm/h`;
  }

  if (typeof snowfall === 'number' && snowfall > 0.1) {
    intensity = `${snowfall.toFixed(1)} cm/h`;
  }

  const windVector =
    typeof windSpeed === 'number'
      ? `${toWindDirectionLabel(windDirection)} ${windSpeed.toFixed(1)} m/s`
      : '—';

  const atmosphereType = deriveAtmosphereType({
    temperature,
    humidity,
    precipitation,
    cloudCover,
  });

  return {
    intensity,
    windVector,
    atmosphereType,
    latitude: formatCoordinate(coords.latitude, 'N', 'S'),
    longitude: formatCoordinate(coords.longitude, 'E', 'W'),
  };
}