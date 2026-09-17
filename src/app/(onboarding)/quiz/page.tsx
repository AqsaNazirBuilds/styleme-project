"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  STYLE_OPTIONS,
  COLOR_OPTIONS,
  CATEGORY_OPTIONS,
  OCCASION_OPTIONS,
} from "@/lib/validations/style-preference";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "favoriteStyles", title: "What's your style?", options: STYLE_OPTIONS },
  { key: "preferredColors", title: "Which colors do you love?", options: COLOR_OPTIONS },
  { key: "favoriteCategories", title: "What do you wear most?", options: CATEGORY_OPTIONS },
  { key: "preferredOccasions", title: "Where do you dress for?", options: OCCASION_OPTIONS },
] as const;

type Selections = Record<(typeof STEPS)[number]["key"], string[]>;

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selections, setSelections] = useState<Selections>({
    favoriteStyles: [],
    preferredColors: [],
    favoriteCategories: [],
    preferredOccasions: [],
  });

  const current = STEPS[step];
  const currentSelected = selections[current.key];

  const toggleOption = (option: string) => {
    setError(null);
    setSelections((prev) => {
      const already = prev[current.key].includes(option);
      return {
        ...prev,
        [current.key]: already
          ? prev[current.key].filter((o) => o !== option)
          : [...prev[current.key], option],
      };
    });
  };

  const handleNext = async () => {
    if (currentSelected.length === 0) {
      setError("Pick at least one option to continue");
      return;
    }

    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/profile/style-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selections),
      });

      if (!res.ok) {
        const result = await res.json();
        setError(result.message ?? "Something went wrong");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full",
                i <= step ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        <h1 className="mb-6 text-center text-3xl">{current.title}</h1>

        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {current.options.map((option) => {
            const isSelected = currentSelected.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleOption(option)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition-colors",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:bg-accent"
                )}
              >
                {option}
              </button>
            );
          })}
        </div>

        {error && (
          <p className="mb-4 text-center text-sm text-destructive">{error}</p>
        )}

        <Button onClick={handleNext} disabled={isSubmitting} className="w-full">
          {isSubmitting
            ? "Saving..."
            : step < STEPS.length - 1
              ? "Next"
              : "Finish"}
        </Button>
      </div>
    </div>
  );
}