"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ItemActions({
  itemId,
  isFavorite,
}: {
  itemId: string;
  isFavorite: boolean;
}) {
  const router = useRouter();
  const [favorite, setFavorite] = useState(isFavorite);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const toggleFavorite = async () => {
    const next = !favorite;
    setFavorite(next);

    const res = await fetch(`/api/wardrobe/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: next }),
    });

    if (!res.ok) {
      setFavorite(!next);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    const res = await fetch(`/api/wardrobe/${itemId}`, { method: "DELETE" });

    if (res.ok) {
      router.push("/wardrobe");
      router.refresh();
    } else {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={toggleFavorite}
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart className={favorite ? "fill-primary text-primary" : ""} />
      </Button>

      <Button
        variant="outline"
        render={<Link href={`/wardrobe/${itemId}/edit`} />}
        nativeButton={false}
      >
        <Pencil /> Edit
      </Button>

      {confirmDelete ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Are you sure?</span>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Yes, delete"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          variant="destructive"
          size="icon"
          onClick={() => setConfirmDelete(true)}
          aria-label="Delete item"
        >
          <Trash2 />
        </Button>
      )}
    </div>
  );
}