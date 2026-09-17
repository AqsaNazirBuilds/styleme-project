import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { OutfitActions } from "@/components/outfits/outfit-actions";
import { calculateCompatibility } from "@/lib/scoring/compatibility";

export default async function OutfitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const outfit = await prisma.outfit.findUnique({
    where: { id },
    include: { items: { include: { wardrobeItem: true } } },
  });

  if (!outfit || outfit.userId !== session.user.id) {
    notFound();
  }

  const wardrobeItems = outfit.items.map((i) => i.wardrobeItem);
  const score = calculateCompatibility(wardrobeItems, outfit.occasion ?? undefined);

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl">{outfit.name}</h1>
            <p className="text-muted-foreground">
              {outfit.occasion ? outfit.occasion : ""}
              {outfit.occasion && outfit.style ? " · " : ""}
              {outfit.style ? outfit.style : ""}
            </p>
          </div>
          <OutfitActions outfitId={outfit.id} isFavorite={outfit.isFavorite} />
        </div>

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

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {wardrobeItems.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-md border border-border">
              <div className="relative aspect-square w-full">
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
              </div>
              <div className="p-2">
                <p className="truncate text-sm">{item.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}