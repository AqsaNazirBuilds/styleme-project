import { z } from "zod";

export const outfitSchema = z.object({
  name: z.string().min(1, "Name is required"),
  occasion: z.string().optional(),
  style: z.string().optional(),
  itemIds: z.array(z.string()).min(2, "Select at least 2 items"),
});

export type OutfitInput = z.infer<typeof outfitSchema>;