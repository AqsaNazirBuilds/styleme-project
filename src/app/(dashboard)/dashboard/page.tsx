import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Shirt, Layers, Calendar } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const stylePreference = await prisma.stylePreference.findUnique({
    where: { userId: session.user.id },
  });

  if (!stylePreference) {
    redirect("/quiz");
  }

  const userId = session.user.id;

  const [wardrobeCount, outfitCount, recentItems, upcomingLooks] = await Promise.all([
    prisma.wardrobeItem.count({ where: { userId } }),
    prisma.outfit.count({ where: { userId } }),
    prisma.wardrobeItem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.calendarEvent.findMany({
      where: { userId, date: { gte: new Date() } },
      orderBy: { date: "asc" },
      take: 3,
      include: { outfit: true },
    }),
  ]);

  return (
    <div className="min-h-screen bg-background px-8 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-1 text-3xl">Welcome back, {session.user?.name}</h1>
        <p className="mb-8 text-muted-foreground">
          Here's what's happening with your wardrobe.
        </p>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-border bg-card p-4 text-center">
            <p className="text-2xl text-primary">{wardrobeCount}</p>
            <p className="text-xs text-muted-foreground">Wardrobe items</p>
          </div>
          <div className="rounded-md border border-border bg-card p-4 text-center">
            <p className="text-2xl text-primary">{outfitCount}</p>
            <p className="text-xs text-muted-foreground">Saved outfits</p>
          </div>
          <div className="rounded-md border border-border bg-card p-4 text-center">
            <p className="text-2xl text-primary">{upcomingLooks.length}</p>
            <p className="text-xs text-muted-foreground">Upcoming looks</p>
          </div>
        </div>

        <div className="mb-8 flex items-center justify-between rounded-md bg-accent p-5">
          <div>
            <p className="mb-1 flex items-center gap-1.5 font-medium text-accent-foreground">
              <Sparkles className="size-4" /> Style Me
            </p>
            <p className="text-sm text-accent-foreground/80">
              Get an outfit recommendation from your wardrobe
            </p>
          </div>
          <Button render={<Link href="/style-me" />} nativeButton={false}>
            Generate look
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-1.5 font-medium">
                <Shirt className="size-4" /> Recent wardrobe
              </p>
              <Link href="/wardrobe" className="text-xs text-primary underline">
                View all
              </Link>
            </div>

            {recentItems.length === 0 ? (
              <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No items yet
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {recentItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/wardrobe/${item.id}`}
                    className="relative aspect-square overflow-hidden rounded-md border border-border"
                  >
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-1.5 font-medium">
                <Calendar className="size-4" /> Upcoming looks
              </p>
              <Link href="/planner" className="text-xs text-primary underline">
                View planner
              </Link>
            </div>

            {upcomingLooks.length === 0 ? (
              <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                Nothing planned
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {upcomingLooks.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between rounded-md border border-border bg-card p-3 text-sm"
                  >
                    <span>{event.outfit.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}