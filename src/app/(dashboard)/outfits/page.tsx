import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function OutfitsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const outfits = await prisma.outfit.findMany({
    where: { userId: session.user.id },
    include: { items: { include: { wardrobeItem: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl">Your outfits</h1>
            <p className="text-muted-foreground">
              {outfits.length} {outfits.length === 1 ? "outfit" : "outfits"}
            </p>
          </div>
          <Button render={<Link href="/outfits/new" />} nativeButton={false}>
            Build an outfit
          </Button>
        </div>

        {outfits.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border py-20 text-center">
            <p className="mb-2 text-lg">You haven&apos;t created any outfits yet</p>
            <p className="mb-6 text-sm text-muted-foreground">
              Combine items from your wardrobe into a complete look.
            </p>
            <Button render={<Link href="/outfits/new" />} nativeButton={false}>
              Build your first outfit
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {outfits.map((outfit) => (
              <Link
                key={outfit.id}
                href={`/outfits/${outfit.id}`}
                className="overflow-hidden rounded-md border border-border bg-card transition-opacity hover:opacity-90"
              >
                <div className="grid grid-cols-2 gap-0.5 bg-border p-0.5">
                  {outfit.items.slice(0, 4).map(({ wardrobeItem }) => (
                    <div key={wardrobeItem.id} className="relative aspect-square">
                      <Image
                        src={wardrobeItem.imageUrl}
                        alt={wardrobeItem.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between p-3">
                  <div>
                    <p className="truncate text-sm font-medium">{outfit.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {outfit.items.length} items
                      {outfit.occasion ? ` · ${outfit.occasion}` : ""}
                    </p>
                  </div>
                  {outfit.isFavorite && (
                    <Heart className="size-4 shrink-0 fill-primary text-primary" />
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}