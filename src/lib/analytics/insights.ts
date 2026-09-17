type AnalyticsData = {
  totalItems: number;
  totalOutfits: number;
  totalFavoriteItems: number;
  categoryDistribution: { name: string; value: number }[];
  colorDistribution: { name: string; value: number }[];
  styleDistribution: { name: string; value: number }[];
};

export function generateInsights(data: AnalyticsData): string[] {
  const insights: string[] = [];

  if (data.totalItems === 0) {
    return ["Add wardrobe items to start seeing personalized insights."];
  }

  const topColor = data.colorDistribution[0];
  if (topColor && topColor.value >= 2) {
    insights.push(`${topColor.name} is one of your most-used colors, appearing in ${topColor.value} items.`);
  }

  const neutralColors = ["Black", "White", "Beige", "Gray", "Navy"];
  const neutralCount = data.colorDistribution
    .filter((c) => neutralColors.includes(c.name))
    .reduce((sum, c) => sum + c.value, 0);
  const neutralRatio = neutralCount / data.totalItems;

  if (neutralRatio > 0.6) {
    insights.push("Your wardrobe leans heavily neutral — a few bold statement pieces could add variety.");
  }

  const topCategory = data.categoryDistribution[0];
  const leastCategory = data.categoryDistribution[data.categoryDistribution.length - 1];
  if (topCategory && leastCategory && topCategory.name !== leastCategory.name) {
    insights.push(`You have many ${topCategory.name.toLowerCase()} but fewer ${leastCategory.name.toLowerCase()} — consider balancing your wardrobe.`);
  }

  const topStyle = data.styleDistribution[0];
  if (topStyle && topStyle.value >= 2) {
    insights.push(`You frequently create ${topStyle.name.toLowerCase()}-style outfits.`);
  }

  if (data.totalOutfits === 0) {
    insights.push("You haven't built any outfits yet — try the Outfit Builder or Style Me to get started.");
  }

  if (insights.length === 0) {
    insights.push("Keep adding items and outfits to unlock more personalized insights.");
  }

  return insights;
}