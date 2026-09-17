import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WardrobeFilters } from "@/components/wardrobe/wardrobe-filters";
import type { Prisma } from "@/generated/prisma/client";

export default async function WardrobePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; color?: string; sort?: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { q, category, color, sort } = await searchParams;

  const where: Prisma.WardrobeItemWhereInput = {
    userId: session.user.id,
    ...(q && { name: { contains: q, mode: "insensitive" } }),
    ...(category && { category }),
    ...(color && { color }),
  };

  const orderBy: Prisma.WardrobeItemOrderByWithRelationInput =
    sort === "oldest"
      ? { createdAt: "asc" }
      : sort === "name"
        ? { name: "asc" }
        : sort === "favorites"
          ? { isFavorite: "desc" }
          : { createdAt: "desc" };

  const items = await prisma.wardrobeItem.findMany({ where, orderBy });
  const totalItems = await prisma.wardrobeItem.count({
    where: { userId: session.user.id },
  });

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl">Your wardrobe</h1>
            <p className="text-muted-foreground">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </p>
          </div>
          <Button render={<Link href="/wardrobe/add" />} nativeButton={false}>
            Add item
          </Button>
        </div>

        {totalItems > 0 && <WardrobeFilters />}

        {totalItems === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border py-20 text-center">
            <p className="mb-2 text-lg">Your wardrobe is empty</p>
            <p className="mb-6 text-sm text-muted-foreground">
              Add your first item to start building your digital closet.
            </p>
            <Button render={<Link href="/wardrobe/add" />} nativeButton={false}>
              Add your first item
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border py-20 text-center">
            <p className="text-lg">No items match your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/wardrobe/${item.id}`}
                className="overflow-hidden rounded-md border border-border bg-card transition-opacity hover:opacity-90"
              >
                <div className="relative aspect-square w-full">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                  {item.isFavorite && (
                    <Heart className="absolute top-2 right-2 size-5 fill-primary text-primary" />
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.category} · {item.color}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}