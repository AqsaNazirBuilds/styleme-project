import { z } from "zod";

export const calendarEventSchema = z.object({
  outfitId: z.string().min(1, "Select an outfit"),
  date: z.string().min(1, "Select a date"),
  occasion: z.string().optional(),
  notes: z.string().optional(),
});

export type CalendarEventInput = z.infer<typeof calendarEventSchema>;