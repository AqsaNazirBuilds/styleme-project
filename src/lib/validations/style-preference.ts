import { z } from "zod";

export const stylePreferenceSchema = z.object({
  favoriteStyles: z.array(z.string()).min(1, "Pick at least one style"),
  preferredColors: z.array(z.string()).min(1, "Pick at least one color"),
  favoriteCategories: z.array(z.string()).min(1, "Pick at least one category"),
  preferredOccasions: z.array(z.string()).min(1, "Pick at least one occasion"),
});

export type StylePreferenceInput = z.infer<typeof stylePreferenceSchema>;

export const STYLE_OPTIONS = ["Chic", "Feminine", "Minimal", "Elegant", "Trendy", "Classic"];
export const COLOR_OPTIONS = ["Black", "White", "Beige", "Navy", "Burgundy", "Pastels", "Earth tones", "Bold colors"];
export const CATEGORY_OPTIONS = ["Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Bags", "Accessories"];
export const OCCASION_OPTIONS = ["University", "Work", "Casual", "Dinner", "Wedding", "Travel"];