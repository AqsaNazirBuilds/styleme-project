type WardrobeItem = {
  id: string;
  name: string;
  category: string;
  color: string;
  season: string | null;
  occasion: string | null;
};

type PackingWeather = {
  avgTempC: number;
  willRain: boolean;
} | null;

function seasonFromTemp(tempC: number): string {
  if (tempC <= 10) return "Winter";
  if (tempC <= 20) return "Fall";
  return "Summer";
}

export function buildPackingList(
  wardrobe: WardrobeItem[],
  days: number,
  occasion: string,
  weather: PackingWeather
) {
  const targetSeason = weather ? seasonFromTemp(weather.avgTempC) : null;

  const scoreItem = (item: WardrobeItem) => {
    let score = 30;
    if (item.occasion === occasion) score += 30;
    if (targetSeason && (item.season === targetSeason || item.season === "All-season")) score += 25;
    return score;
  };

  const rank = (items: WardrobeItem[]) =>
    [...items].sort((a, b) => scoreItem(b) - scoreItem(a));

  const tops = rank(wardrobe.filter((i) => i.category === "Tops" || i.category === "Dresses"));
  const bottoms = rank(wardrobe.filter((i) => i.category === "Bottoms"));
  const shoes = rank(wardrobe.filter((i) => i.category === "Shoes"));
  const outerwear = rank(wardrobe.filter((i) => i.category === "Outerwear"));
  const accessories = rank(wardrobe.filter((i) => i.category === "Bags" || i.category === "Accessories"));

  // Reusability-focused counts: fewer items than days, meant to be mixed and matched
  const topCount = Math.max(2, Math.min(days, 6));
  const bottomCount = Math.max(2, Math.min(Math.ceil(days / 2), 4));

  const packingList = [
    ...tops.slice(0, topCount),
    ...bottoms.slice(0, bottomCount),
    ...shoes.slice(0, 2),
    ...(weather && weather.avgTempC < 18 ? outerwear.slice(0, 1) : []),
    ...accessories.slice(0, 2),
  ];

  return {
    items: packingList,
    weatherNote: weather
      ? `Expect around ${weather.avgTempC}°C${weather.willRain ? " with rain — pack a rain layer." : "."}`
      : "Weather data unavailable — packed based on your wardrobe and trip length.",
  };
}