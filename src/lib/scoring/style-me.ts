type WardrobeItem = {
  id: string;
  name: string;
  category: string;
  color: string;
  secondColor: string | null;
  style: string | null;
  occasion: string | null;
  season: string | null;
};

const TOP_LAYER = ["Tops", "Dresses"];
const BOTTOM_LAYER = ["Bottoms"];
const SHOE_LAYER = ["Shoes"];
const ACCESSORY_LAYER = ["Bags", "Accessories", "Outerwear"];

function scoreItemForContext(
  item: WardrobeItem,
  occasion: string,
  style: string
): number {
  let score = 50;
  if (item.occasion === occasion) score += 30;
  if (item.style === style) score += 20;
  return score;
}

function pickBestFrom(
  items: WardrobeItem[],
  categories: string[],
  occasion: string,
  style: string,
  exclude: Set<string>
): WardrobeItem | null {
  const candidates = items.filter(
    (i) => categories.includes(i.category) && !exclude.has(i.id)
  );
  if (candidates.length === 0) return null;

  candidates.sort(
    (a, b) => scoreItemForContext(b, occasion, style) - scoreItemForContext(a, occasion, style)
  );
  return candidates[0];
}

export function selectOutfitForStyleMe(
  wardrobe: WardrobeItem[],
  occasion: string,
  style: string
): WardrobeItem[] {
  const selected: WardrobeItem[] = [];
  const used = new Set<string>();

  const topOrDress = pickBestFrom(wardrobe, TOP_LAYER, occasion, style, used);
  if (topOrDress) {
    selected.push(topOrDress);
    used.add(topOrDress.id);
  }

  // Only add bottoms if we didn't already pick a dress
  if (topOrDress?.category !== "Dresses") {
    const bottom = pickBestFrom(wardrobe, BOTTOM_LAYER, occasion, style, used);
    if (bottom) {
      selected.push(bottom);
      used.add(bottom.id);
    }
  }

  const shoes = pickBestFrom(wardrobe, SHOE_LAYER, occasion, style, used);
  if (shoes) {
    selected.push(shoes);
    used.add(shoes.id);
  }

  const accessory = pickBestFrom(wardrobe, ACCESSORY_LAYER, occasion, style, used);
  if (accessory) {
    selected.push(accessory);
    used.add(accessory.id);
  }

  return selected;
}