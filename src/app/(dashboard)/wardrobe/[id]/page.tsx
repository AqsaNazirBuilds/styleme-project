import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { ItemActions } from "@/components/wardrobe/item-actions";

export default async function WardrobeItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const item = await prisma.wardrobeItem.findUnique({ where: { id } });

  if (!item || item.userId !== session.user.id) {
    notFound();
  }

  const details: [string, string | null][] = [
    ["Category", item.category],
    ["Subcategory", item.subcategory],
    ["Color", item.color],
    ["Second color", item.secondColor],
    ["Pattern", item.pattern],
    ["Material", item.material],
    ["Season", item.season],
    ["Occasion", item.occasion],
    ["Style", item.style],
    ["Brand", item.brand],
  ];

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-md border border-border">
          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
        </div>

        <div>
          <h1 className="mb-2 text-3xl">{item.name}</h1>
          <div className="mb-6">
            <ItemActions itemId={item.id} isFavorite={item.isFavorite} />
          </div>

          <dl className="grid grid-cols-2 gap-y-3 text-sm">
            {details
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label}>
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
          </dl>

          {item.notes && (
            <div className="mt-6">
              <p className="mb-1 text-sm text-muted-foreground">Notes</p>
              <p className="text-sm">{item.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}