import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "You must be signed in" }, { status: 401 });
  }

  const userId = session.user.id;

  const [
    totalItems,
    totalOutfits,
    totalFavoriteItems,
    totalFavoriteOutfits,
    categoryGroups,
    colorGroups,
    styleGroups,
    occasionGroups,
    upcomingLooksCount,
  ] = await Promise.all([
    prisma.wardrobeItem.count({ where: { userId } }),
    prisma.outfit.count({ where: { userId } }),
    prisma.wardrobeItem.count({ where: { userId, isFavorite: true } }),
    prisma.outfit.count({ where: { userId, isFavorite: true } }),
    prisma.wardrobeItem.groupBy({
      by: ["category"],
      where: { userId },
      _count: { category: true },
    }),
    prisma.wardrobeItem.groupBy({
      by: ["color"],
      where: { userId },
      _count: { color: true },
    }),
    prisma.outfit.groupBy({
      by: ["style"],
      where: { userId, style: { not: null } },
      _count: { style: true },
    }),
    prisma.wardrobeItem.groupBy({
      by: ["occasion"],
      where: { userId, occasion: { not: null } },
      _count: { occasion: true },
    }),
    prisma.calendarEvent.count({
      where: { userId, date: { gte: new Date() } },
    }),
  ]);

  const categoryDistribution = categoryGroups
    .map((g) => ({ name: g.category, value: g._count.category }))
    .sort((a, b) => b.value - a.value);

  const colorDistribution = colorGroups
    .map((g) => ({ name: g.color, value: g._count.color }))
    .sort((a, b) => b.value - a.value);

  const styleDistribution = styleGroups
    .map((g) => ({ name: g.style as string, value: g._count.style }))
    .sort((a, b) => b.value - a.value);

  const occasionDistribution = occasionGroups
    .map((g) => ({ name: g.occasion as string, value: g._count.occasion }))
    .sort((a, b) => b.value - a.value);

  return NextResponse.json({
    success: true,
    data: {
      totalItems,
      totalOutfits,
      totalFavoriteItems,
      totalFavoriteOutfits,
      upcomingLooksCount,
      categoryDistribution,
      colorDistribution,
      styleDistribution,
      occasionDistribution,
    },
  });
}