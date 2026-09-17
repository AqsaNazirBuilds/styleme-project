"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OCCASION_OPTIONS } from "@/lib/validations/wardrobe";
import { Luggage } from "lucide-react";

type PackingItem = {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
};

type PackingResult = {
  destination: string;
  days: number;
  occasion: string;
  weatherAvailable: boolean;
  weatherNote: string;
  items: PackingItem[];
};

export default function PackingAssistantPage() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("3");
  const [occasion, setOccasion] = useState("");
  const [result, setResult] = useState<PackingResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setError(null);

    if (!destination.trim() || !occasion) {
      setError("Fill in destination and occasion");
      return;
    }

    setIsGenerating(true);

    try {
      const res = await fetch("/api/ai/packing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, days, occasion }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "Something went wrong");
        return;
      }

      setResult(data.data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-2">
          <Luggage className="size-6 text-primary" />
          <h1 className="text-3xl">Packing assistant</h1>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-2 sm:col-span-1">
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              placeholder="e.g. Paris"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="days">Days</Label>
            <Input
              id="days"
              type="number"
              min={1}
              max={14}
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="trip-type">Trip type</Label>
            <Select value={occasion} onValueChange={(v) => setOccasion(v ?? "")}>
              <SelectTrigger id="trip-type" aria-label="Trip type">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {OCCASION_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

        <Button onClick={handleGenerate} disabled={isGenerating} className="mb-8 w-full">
          {isGenerating ? "Generating..." : "Generate packing list"}
        </Button>

        {result && (
          <>
            <div className="mb-6 rounded-md border border-border bg-card p-4">
              <p className="mb-1 font-medium">
                {result.days} days in {result.destination}
              </p>
              <p className="text-sm text-muted-foreground">{result.weatherNote}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {result.items.map((item) => (
                <div key={item.id} className="overflow-hidden rounded-md border border-border">
                  <div className="relative aspect-square w-full">
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                  </div>
                  <p className="truncate p-2 text-xs">{item.name}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}