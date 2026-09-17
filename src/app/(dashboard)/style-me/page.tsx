"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { OCCASION_OPTIONS, STYLE_OPTIONS } from "@/lib/validations/wardrobe";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

type WardrobeItem = {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  color: string;
};

type StyleMeResult = {
  items: WardrobeItem[];
  occasion: string;
  style: string;
  score: {
    overall: number;
    colorHarmony: number;
    styleMatch: number;
    occasionMatch: number;
    seasonMatch: number;
  };
  explanation: string;
  tips: string;
  isFallback: boolean;
};

export default function StyleMePage() {
  const router = useRouter();
  const [step, setStep] = useState<"occasion" | "style" | "result">("occasion");
  const [occasion, setOccasion] = useState<string>("");
  const [style, setStyle] = useState<string>("");
  const [result, setResult] = useState<StyleMeResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const generateLook = async () => {
    setError(null);
    setIsGenerating(true);

    try {
      const res = await fetch("/api/ai/style-me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occasion, style }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "Something went wrong");
        setStep("style");
        return;
      }

      setResult(data.data);
      setStep("result");
    } catch {
      setError("Something went wrong. Please try again.");
      setStep("style");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setIsSaving(true);

    try {
      const res = await fetch("/api/outfits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${result.style} ${result.occasion}`,
          occasion: result.occasion,
          style: result.style,
          itemIds: result.items.map((i) => i.id),
        }),
      });

      if (res.ok) {
        router.push("/outfits");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      {step === "occasion" && (
        <div className="w-full max-w-lg text-center">
          <Sparkles className="mx-auto mb-4 size-8 text-primary" />
          <h1 className="mb-6 text-3xl">Where are you going?</h1>
          <div className="flex flex-wrap justify-center gap-2">
            {OCCASION_OPTIONS.map((o) => (
              <button
                key={o}
                onClick={() => {
                  setOccasion(o);
                  setStep("style");
                }}
                className="rounded-full border border-border bg-card px-5 py-2 text-sm hover:bg-accent"
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "style" && (
        <div className="w-full max-w-lg text-center">
          <h1 className="mb-6 text-3xl">How do you want to look?</h1>
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {STYLE_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={cn(
                  "rounded-full border px-5 py-2 text-sm transition-colors",
                  style === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:bg-accent"
                )}
              >
                {s}
              </button>
            ))}
          </div>

          {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

          <Button onClick={generateLook} disabled={!style || isGenerating} className="w-full">
            {isGenerating ? "Generating..." : "Generate Look"}
          </Button>
        </div>
      )}

      {step === "result" && result && (
        <div className="w-full max-w-2xl">
          <h1 className="mb-1 text-center text-3xl">Style Me Result</h1>
          {result.isFallback && (
            <p className="mb-4 text-center text-xs text-muted-foreground">
              (Using offline styling logic — AI explanation unavailable)
            </p>
          )}

          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {result.items.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-md border border-border">
                <div className="relative aspect-square w-full">
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                </div>
                <p className="truncate p-2 text-xs">{item.name}</p>
              </div>
            ))}
          </div>

          <div className="mb-4 rounded-md border border-border bg-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-medium">{result.style} {result.occasion}</p>
              <p className="text-xl text-primary">{result.score.overall}%</p>
            </div>
            <p className="mb-3 text-sm text-muted-foreground">{result.explanation}</p>
            <p className="text-sm italic text-muted-foreground">💡 {result.tips}</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setStep("style");
                setResult(null);
              }}
              className="flex-1"
            >
              Regenerate
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="flex-1">
              {isSaving ? "Saving..." : "Save outfit"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}