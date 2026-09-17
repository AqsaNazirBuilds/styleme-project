"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Outfit = {
  id: string;
  name: string;
  items: { wardrobeItem: { imageUrl: string; name: string } }[];
};

type CalendarEvent = {
  id: string;
  date: string;
  occasion: string | null;
  outfit: Outfit;
};

export default function PlannerPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedOutfitId, setSelectedOutfitId] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isScheduling, setIsScheduling] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/calendar").then((r) => r.json()),
      fetch("/api/outfits").then((r) => r.json()),
    ]).then(([eventsRes, outfitsRes]) => {
      if (eventsRes.success) setEvents(eventsRes.data);
      if (outfitsRes.success) setOutfits(outfitsRes.data);
      setIsLoading(false);
    });
  }, []);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const event of events) {
      const key = new Date(event.date).toDateString();
      map[key] = [...(map[key] ?? []), event];
    }
    return map;
  }, [events]);

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();

    const days: (Date | null)[] = Array(startPadding).fill(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [currentMonth]);

  const handleSchedule = async () => {
    if (!selectedDate || !selectedOutfitId) return;
    setIsScheduling(true);

    try {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outfitId: selectedOutfitId, date: selectedDate }),
      });

      const result = await res.json();

      if (res.ok) {
        setEvents((prev) => [...prev, result.data]);
        setSelectedDate(null);
        setSelectedOutfitId("");
      }
    } finally {
      setIsScheduling(false);
    }
  };

  const handleRemove = async (eventId: string) => {
    const res = await fetch(`/api/calendar/${eventId}`, { method: "DELETE" });
    if (res.ok) {
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading your planner...</p>
      </div>
    );
  }

  const monthLabel = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl">Outfit planner</h1>

        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Previous month"
            onClick={() =>
              setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
            }
          >
            <ChevronLeft />
          </Button>
          <p className="text-lg">{monthLabel}</p>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Next month"
            onClick={() =>
              setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
            }
          >
            <ChevronRight />
          </Button>
        </div>

        <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((day, i) => {
            if (!day) return <div key={i} />;
            const dayEvents = eventsByDate[day.toDateString()] ?? [];
            const isSelected = selectedDate === day.toISOString().split("T")[0];

            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedDate(day.toISOString().split("T")[0])}
                className={cn(
                  "flex min-h-20 flex-col gap-1 rounded-md border p-1 text-left transition-colors",
                  isSelected ? "border-primary" : "border-border hover:bg-muted"
                )}
              >
                <span className="text-xs text-muted-foreground">{day.getDate()}</span>
                {dayEvents.slice(0, 2).map((event) => (
                  <div key={event.id} className="relative aspect-square w-full overflow-hidden rounded-sm">
                    <Image
                      src={event.outfit.items[0]?.wardrobeItem.imageUrl}
                      alt={event.outfit.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </button>
            );
          })}
        </div>

        {selectedDate && (
          <div className="mt-6 rounded-md border border-border bg-card p-4">
            <p className="mb-3 font-medium">
              {new Date(selectedDate).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>

            {(eventsByDate[new Date(selectedDate).toDateString()] ?? []).map((event) => (
              <div key={event.id} className="mb-2 flex items-center justify-between rounded-md border border-border p-2">
                <span className="text-sm">{event.outfit.name}</span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${event.outfit.name} from this date`}
                  onClick={() => handleRemove(event.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}

            {outfits.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Build an outfit first to schedule it here.
              </p>
            ) : (
              <div className="flex gap-2">
                <Select value={selectedOutfitId} onValueChange={setSelectedOutfitId}>
                  <SelectTrigger className="flex-1" aria-label="Select an outfit">
                    <SelectValue placeholder="Select an outfit" />
                  </SelectTrigger>
                  <SelectContent>
                    {outfits.map((o) => (
                      <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleSchedule} disabled={!selectedOutfitId || isScheduling}>
                  {isScheduling ? "Scheduling..." : "Schedule"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}