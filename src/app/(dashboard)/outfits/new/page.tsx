"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { OCCASION_OPTIONS, STYLE_OPTIONS } from "@/lib/validations/wardrobe";
import { calculateCompatibility } from "@/lib/scoring/compatibility";
import { cn } from "@/lib/utils";

type WardrobeItem = {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  color: string;
  secondColor: string | null;
  style: string | null;
  occasion: string | null;
  season: string | null;
};

export default function NewOutfitPage() {
  const router = useRouter();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [occasion, setOccasion] = useState<string>("");
  const [style, setStyle] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/wardrobe")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setItems(result.data);
        setIsLoading(false);
      });
  }, []);

  const selectedItems = useMemo(
    () => items.filter((i) => selectedIds.includes(i.id)),
    [items, selectedIds]
  );

  const score = useMemo(() => {
    if (selectedItems.length < 2) return null;
    return calculateCompatibility(selectedItems, occasion || undefined);
  }, [selectedItems, occasion]);

  const toggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setError(null);

    if (!name.trim()) {
      setError("Give your outfit a name");
      return;
    }

    if (selectedIds.length < 2) {
      setError("Select at least 2 items");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/outfits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, occasion, style, itemIds: selectedIds }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.message ?? "Something went wrong");
        return;
      }

      router.push("/outfits");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading your wardrobe...</p>
      </div>
    );
  }

  if (items.length < 2) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-background text-center">
        <p className="text-lg">You need at least 2 wardrobe items to build an outfit</p>
        <Button render={<a href="/wardrobe/add" />} nativeButton={false}>
          Add wardrobe items
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl">Build an outfit</h1>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="outfit-name">Name</Label>
            <Input
              id="outfit-name"
              placeholder="e.g. Minimal Chic"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Occasion</Label>
            <Select value={occasion} onValueChange={(v) => setOccasion(v ?? "")}>
              <SelectTrigger aria-label="Occasion">
                <SelectValue placeholder="Select occasion" />
              </SelectTrigger>
              <SelectContent>
                {OCCASION_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Style</Label>
            <Select value={style} onValueChange={(v) => setStyle(v ?? "")}>
              <SelectTrigger aria-label="Style">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                {STYLE_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {score && (
          <div className="mb-6 rounded-md border border-border bg-card p-4">
            <div className="mb-3 flex items-baseline justify-between">
              <p className="text-lg font-medium">Style Match</p>
              <p className="text-2xl text-primary">{score.overall}%</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground sm:grid-cols-4">
              <p>Color Harmony — {score.colorHarmony}%</p>
              <p>Style Match — {score.styleMatch}%</p>
              <p>Occasion Match — {score.occasionMatch}%</p>
              <p>Season Match — {score.seasonMatch}%</p>
            </div>
          </div>
        )}

        <p className="mb-3 text-sm text-muted-foreground">
          Select items ({selectedIds.length} selected)
        </p>
        <div className="mb-6 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {items.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleItem(item.id)}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-md border-2 transition-all",
                  isSelected ? "border-primary" : "border-border opacity-70 hover:opacity-100"
                )}
              >
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
              </button>
            );
          })}
        </div>

        {error && <p className="mb-4 text-center text-sm text-destructive">{error}</p>}

        <Button onClick={handleSave} disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : "Save outfit"}
        </Button>
      </div>
    </div>
  );
}