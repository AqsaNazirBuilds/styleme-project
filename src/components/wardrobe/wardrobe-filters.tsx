"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORY_OPTIONS, COLOR_OPTIONS } from "@/lib/validations/wardrobe";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";

export function WardrobeFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const debouncedSearch = useDebouncedCallback((value: string) => {
    updateParam("q", value);
  }, 400);

  return (
    <div className="mb-6 flex flex-wrap gap-3">
            <Input
        key={searchParams.get("q") ?? ""}
        placeholder="Search your wardrobe..."
        defaultValue={searchParams.get("q") ?? ""}
        onChange={(e) => debouncedSearch(e.target.value)}
        className="max-w-xs"
      />

      <Select
        value={searchParams.get("category") ?? "all"}
        onValueChange={(v) => updateParam("category", v)}
      >
        <SelectTrigger className="w-40" aria-label="Filter by category">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {CATEGORY_OPTIONS.map((c) => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("color") ?? "all"}
        onValueChange={(v) => updateParam("color", v)}
      >
        <SelectTrigger className="w-40" aria-label="Filter by color">
          <SelectValue placeholder="Color" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All colors</SelectItem>
          {COLOR_OPTIONS.map((c) => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("sort") ?? "newest"}
        onValueChange={(v) => updateParam("sort", v)}
      >
        <SelectTrigger className="w-40" aria-label="Sort wardrobe items">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest first</SelectItem>
          <SelectItem value="oldest">Oldest first</SelectItem>
          <SelectItem value="name">Name (A-Z)</SelectItem>
          <SelectItem value="favorites">Favorites first</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}