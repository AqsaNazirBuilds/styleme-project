import { describe, it, expect } from "vitest";
import { calculateCompatibility } from "@/lib/scoring/compatibility";

describe("calculateCompatibility", () => {
  it("returns high scores for a single item (nothing to conflict with)", () => {
    const items = [
      { color: "Black", secondColor: null, style: "Minimal", occasion: "Work", season: "All-season" },
    ];
    const result = calculateCompatibility(items);
    expect(result.colorHarmony).toBe(100);
  });

  it("scores neutral-color combinations higher than clashing bold colors", () => {
    const neutralItems = [
      { color: "Black", secondColor: null, style: "Minimal", occasion: "Work", season: "All-season" },
      { color: "White", secondColor: null, style: "Minimal", occasion: "Work", season: "All-season" },
    ];
    const boldItems = [
      { color: "Red", secondColor: null, style: "Trendy", occasion: "Casual", season: "Summer" },
      { color: "Green", secondColor: null, style: "Trendy", occasion: "Casual", season: "Summer" },
    ];

    const neutralScore = calculateCompatibility(neutralItems);
    const boldScore = calculateCompatibility(boldItems);

    expect(neutralScore.colorHarmony).toBeGreaterThan(boldScore.colorHarmony);
  });

  it("gives a perfect occasion match when all items share the target occasion", () => {
    const items = [
      { color: "Black", secondColor: null, style: "Elegant", occasion: "Wedding", season: "All-season" },
      { color: "White", secondColor: null, style: "Elegant", occasion: "Wedding", season: "All-season" },
    ];

    const result = calculateCompatibility(items, "Wedding");
    expect(result.occasionMatch).toBe(100);
  });

  it("keeps the overall score within 0-100 bounds", () => {
    const items = [
      { color: "Red", secondColor: null, style: null, occasion: null, season: null },
      { color: "Green", secondColor: null, style: null, occasion: null, season: null },
      { color: "Blue", secondColor: null, style: null, occasion: null, season: null },
    ];

    const result = calculateCompatibility(items);
    expect(result.overall).toBeGreaterThanOrEqual(0);
    expect(result.overall).toBeLessThanOrEqual(100);
  });
});