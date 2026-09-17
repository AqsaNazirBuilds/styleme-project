type GeocodingResult = {
  latitude: number;
  longitude: number;
  name: string;
};

type WeatherSummary = {
  avgTempC: number;
  minTempC: number;
  maxTempC: number;
  willRain: boolean;
};

export async function geocodeLocation(query: string): Promise<GeocodingResult | null> {
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1`
    );
    const data = await res.json();
    const result = data.results?.[0];

    if (!result) return null;

    return { latitude: result.latitude, longitude: result.longitude, name: result.name };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

export async function getWeatherForecast(
  latitude: number,
  longitude: number
): Promise<WeatherSummary | null> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=7`
    );
    const data = await res.json();

    const maxTemps: number[] = data.daily?.temperature_2m_max ?? [];
    const minTemps: number[] = data.daily?.temperature_2m_min ?? [];
    const rainChance: number[] = data.daily?.precipitation_probability_max ?? [];

    if (maxTemps.length === 0) return null;

    const avgMax = maxTemps.reduce((a, b) => a + b, 0) / maxTemps.length;
    const avgMin = minTemps.reduce((a, b) => a + b, 0) / minTemps.length;

    return {
      avgTempC: Math.round((avgMax + avgMin) / 2),
      minTempC: Math.round(Math.min(...minTemps)),
      maxTempC: Math.round(Math.max(...maxTemps)),
      willRain: rainChance.some((r) => r > 50),
    };
  } catch (error) {
    console.error("Weather fetch error:", error);
    return null;
  }
}