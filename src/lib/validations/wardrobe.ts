import { z } from "zod";

export const wardrobeItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  color: z.string().min(1, "Color is required"),
  secondColor: z.string().optional(),
  pattern: z.string().optional(),
  material: z.string().optional(),
  season: z.string().optional(),
  occasion: z.string().optional(),
  style: z.string().optional(),
  brand: z.string().optional(),
  notes: z.string().optional(),
});

export type WardrobeItemInput = z.infer<typeof wardrobeItemSchema>;

export const CATEGORY_OPTIONS = [
  "Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Bags", "Accessories",
];

export const COLOR_OPTIONS = [
  "Black", "White", "Beige", "Gray", "Navy", "Burgundy", "Brown",
  "Pink", "Red", "Green", "Blue", "Yellow", "Multicolor",
];

export const SEASON_OPTIONS = ["Spring", "Summer", "Fall", "Winter", "All-season"];

export const OCCASION_OPTIONS = [
  "University", "Work", "Casual", "Dinner", "Wedding", "Travel",
];

export const STYLE_OPTIONS = ["Chic", "Feminine", "Minimal", "Elegant", "Trendy", "Classic"];

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];