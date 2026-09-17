"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import {
  wardrobeItemSchema,
  type WardrobeItemInput,
  CATEGORY_OPTIONS,
  COLOR_OPTIONS,
  SEASON_OPTIONS,
  OCCASION_OPTIONS,
  STYLE_OPTIONS,
  MAX_IMAGE_SIZE,
  ALLOWED_IMAGE_TYPES,
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

export default function AddWardrobeItemPage() {
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<WardrobeItemInput>({
    resolver: zodResolver(wardrobeItemSchema),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError(null);

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError("Only JPEG, PNG, or WEBP images are allowed");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError("Image must be under 5MB");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: WardrobeItemInput) => {
    setServerError(null);

    if (!imageFile) {
      setImageError("An image is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      const res = await fetch("/api/wardrobe", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        setServerError(result.message ?? "Something went wrong");
        return;
      }

      router.push("/wardrobe");
      router.refresh();
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl">Add to your wardrobe</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Photo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                {imagePreview ? (
                  <div className="relative h-48 w-48 overflow-hidden rounded-md border border-border">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-48 w-48 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
                    No image selected
                  </div>
                )}
                <Input type="file" accept="image/*" onChange={handleImageChange} />
                {imageError && (
                  <p className="text-sm text-destructive">{imageError}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="e.g. White Oversized Shirt" {...register("name")} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>Category</Label>
                  <Select onValueChange={(v) => setValue("category", v ?? "")}>
                    <SelectTrigger aria-label="Category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-destructive">{errors.category.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Color</Label>
                  <Select onValueChange={(v) => setValue("color", v ?? "")}>
                    <SelectTrigger aria-label="Color">
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOR_OPTIONS.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.color && (
                    <p className="text-sm text-destructive">{errors.color.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>Season</Label>
                  <Select onValueChange={(v) => setValue("season", v ?? "")}>
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
                  <Select onValueChange={(v) => setValue("occasion", v ?? "")}>
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
                <Select onValueChange={(v) => setValue("style", v ?? "")}>
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
            {isSubmitting ? "Adding..." : "Add to wardrobe"}
          </Button>
        </form>
      </div>
    </div>
  );
}