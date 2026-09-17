import { describe, it, expect } from "vitest";
import { selectOutfitForStyleMe } from "@/lib/scoring/style-me";

const mockWardrobe = [
  { id: "1", name: "White Shirt", category: "Tops", color: "White", secondColor: null, style: "Minimal", occasion: "Work", season: "All-season" },
  { id: "2", name: "Black Trousers", category: "Bottoms", color: "Black", secondColor: null, style: "Minimal", occasion: "Work", season: "All-season" },
  { id: "3", name: "Beige Loafers", category: "Shoes", color: "Beige", secondColor: null, style: "Minimal", occasion: "Work", season: "All-season" },
  { id: "4", name: "Black Bag", category: "Bags", color: "Black", secondColor: null, style: "Elegant", occasion: "Dinner", season: "All-season" },
  { id: "5", name: "Red Dress", category: "Dresses", color: "Red", secondColor: null, style: "Trendy", occasion: "Casual", season: "Summer" },
];

describe("selectOutfitForStyleMe", () => {
  it("selects a top and a bottom, not a dress, when matching a Work/Minimal request", () => {
    const result = selectOutfitForStyleMe(mockWardrobe, "Work", "Minimal");
    const categories = result.map((i) => i.category);

    expect(categories).toContain("Tops");
    expect(categories).toContain("Bottoms");
  });

  it("does not select both a top and a dress in the same outfit", () => {
    const result = selectOutfitForStyleMe(mockWardrobe, "Casual", "Trendy");
    const categories = result.map((i) => i.category);

    const hasDress = categories.includes("Dresses");
    const hasTop = categories.includes("Tops");

    expect(hasDress && hasTop).toBe(false);
  });

  it("never selects the same item twice", () => {
    const result = selectOutfitForStyleMe(mockWardrobe, "Work", "Minimal");
    const ids = result.map((i) => i.id);
    const uniqueIds = new Set(ids);

    expect(ids.length).toBe(uniqueIds.size);
  });

  it("returns an empty array when the wardrobe has no matching categories", () => {
    const emptyWardrobe: typeof mockWardrobe = [];
    const result = selectOutfitForStyleMe(emptyWardrobe, "Work", "Minimal");

    expect(result).toEqual([]);
  });
});