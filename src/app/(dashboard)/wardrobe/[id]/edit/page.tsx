"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  wardrobeItemSchema,
  type WardrobeItemInput,
  CATEGORY_OPTIONS,
  COLOR_OPTIONS,
  SEASON_OPTIONS,
  OCCASION_OPTIONS,
  STYLE_OPTIONS,
} from "@/lib/validations/wardrobe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditWardrobeItemPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<WardrobeItemInput>({
    resolver: zodResolver(wardrobeItemSchema),
  });

   useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/wardrobe/${itemId}`);
      const result = await res.json();

      if (res.ok) {
        const cleaned = Object.fromEntries(
          Object.entries(result.data).map(([key, value]) => [
            key,
            value === null ? undefined : value,
          ])
        );
        reset(cleaned as WardrobeItemInput);
      } else {
        setServerError(result.message ?? "Item not found");
      }
      setIsLoading(false);
    };

    load();
  }, [itemId, reset]);

  const onSubmit = async (data: WardrobeItemInput) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/wardrobe/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setServerError(result.message ?? "Something went wrong");
        return;
      }

      router.push(`/wardrobe/${itemId}`);
      router.refresh();
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl">Edit item</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>Category</Label>
                  <Select onValueChange={(v) => setValue("category", (v ?? "") as string)} defaultValue={undefined}>
                    <SelectTrigger aria-label="Category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Color</Label>
                  <Select onValueChange={(v) => setValue("color", (v ?? "") as string)}>
                    <SelectTrigger aria-label="Color">
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOR_OPTIONS.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>Season</Label>
                  <Select onValueChange={(v) => setValue("season", (v ?? "") as string)}>
                    <SelectTrigger aria-label="Season">
                      <SelectValue placeholder="Select season" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEASON_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Occasion</Label>
                  <Select onValueChange={(v) => setValue("occasion", (v ?? "") as string)}>
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
              </div>

              <div className="flex flex-col gap-2">
                <Label>Style</Label>
                <Select onValueChange={(v) => setValue("style", (v ?? "") as string)}>
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

              <div className="flex flex-col gap-2">
                <Label htmlFor="brand">Brand (optional)</Label>
                <Input id="brand" {...register("brand")} />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea id="notes" {...register("notes")} />
              </div>
            </CardContent>
          </Card>

          {serverError && (
            <p className="text-center text-sm text-destructive">{serverError}</p>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </div>
    </div>
  );
}