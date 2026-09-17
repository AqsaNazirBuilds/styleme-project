type ScorableItem = {
  color: string;
  secondColor: string | null;
  style: string | null;
  occasion: string | null;
  season: string | null;
};

export type CompatibilityBreakdown = {
  overall: number;
  colorHarmony: number;
  styleMatch: number;
  occasionMatch: number;
  seasonMatch: number;
};

const NEUTRAL_COLORS = ["Black", "White", "Beige", "Gray", "Navy", "Brown"];

function scoreColorHarmony(items: ScorableItem[]): number {
  if (items.length < 2) return 100;

  const colors = items.map((i) => i.color);
  const uniqueColors = new Set(colors);
  const neutralCount = colors.filter((c) => NEUTRAL_COLORS.includes(c)).length;
  const neutralRatio = neutralCount / colors.length;

  // Mostly-neutral palettes are safest; too many competing bold colors lowers the score
  let score = 70 + neutralRatio * 25;

  if (uniqueColors.size > items.length - 1 && neutralRatio < 0.3) {
    score -= 15; // many different bold colors together
  }

  return Math.max(40, Math.min(100, Math.round(score)));
}

function scoreStyleMatch(items: ScorableItem[]): number {
  const styles = items.map((i) => i.style).filter(Boolean) as string[];
  if (styles.length === 0) return 70;

  const uniqueStyles = new Set(styles);
  const consistency = 1 - (uniqueStyles.size - 1) / styles.length;

  return Math.round(60 + consistency * 40);
}

function scoreOccasionMatch(items: ScorableItem[], targetOccasion?: string): number {
  const occasions = items.map((i) => i.occasion).filter(Boolean) as string[];
  if (occasions.length === 0) return 70;

  if (targetOccasion) {
    const matching = occasions.filter((o) => o === targetOccasion).length;
    return Math.round(50 + (matching / occasions.length) * 50);
  }

  const uniqueOccasions = new Set(occasions);
  const consistency = 1 - (uniqueOccasions.size - 1) / occasions.length;
  return Math.round(60 + consistency * 40);
}

function scoreSeasonMatch(items: ScorableItem[]): number {
  const seasons = items.map((i) => i.season).filter(Boolean) as string[];
  if (seasons.length === 0) return 70;

  const allSeasonCount = seasons.filter((s) => s === "All-season").length;
  const uniqueSeasons = new Set(seasons.filter((s) => s !== "All-season"));

  if (uniqueSeasons.size <= 1) return 95;
  if (allSeasonCount / seasons.length > 0.5) return 85;

  return Math.round(90 - uniqueSeasons.size * 10);
}

export function calculateCompatibility(
  items: ScorableItem[],
  targetOccasion?: string
): CompatibilityBreakdown {
  const colorHarmony = scoreColorHarmony(items);
  const styleMatch = scoreStyleMatch(items);
  const occasionMatch = scoreOccasionMatch(items, targetOccasion);
  const seasonMatch = scoreSeasonMatch(items);

  const overall = Math.round(
    colorHarmony * 0.3 + styleMatch * 0.3 + occasionMatch * 0.25 + seasonMatch * 0.15
  );

  return { overall, colorHarmony, styleMatch, occasionMatch, seasonMatch };
}