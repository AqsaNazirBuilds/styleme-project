import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    totalUsers,
    newUsersThisWeek,
    totalWardrobeItems,
    totalOutfits,
    totalAIConversations,
    styleDistribution,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.wardrobeItem.count(),
    prisma.outfit.count(),
    prisma.aIConversation.count(),
    prisma.outfit.groupBy({
      by: ["style"],
      where: { style: { not: null } },
      _count: { style: true },
      orderBy: { _count: { style: "desc" } },
      take: 5,
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      totalUsers,
      newUsersThisWeek,
      totalWardrobeItems,
      totalOutfits,
      totalAIConversations,
      popularStyles: styleDistribution.map((s) => ({ name: s.style, count: s._count.style })),
    },
  });
}