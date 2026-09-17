import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { outfitSchema } from "@/lib/validations/outfit";
import { calculateCompatibility } from "@/lib/scoring/compatibility";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "You must be signed in" }, { status: 401 });
  }

  const outfits = await prisma.outfit.findMany({
    where: { userId: session.user.id },
    include: { items: { include: { wardrobeItem: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: outfits });
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "You must be signed in" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = outfitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, occasion, style, itemIds } = parsed.data;

    const wardrobeItems = await prisma.wardrobeItem.findMany({
      where: { id: { in: itemIds }, userId: session.user.id },
    });

    if (wardrobeItems.length !== itemIds.length) {
      return NextResponse.json(
        { success: false, message: "One or more items are invalid" },
        { status: 400 }
      );
    }

    const outfit = await prisma.outfit.create({
      data: {
        userId: session.user.id,
        name,
        occasion,
        style,
        items: {
          create: itemIds.map((wardrobeItemId) => ({ wardrobeItemId })),
        },
      },
      include: { items: { include: { wardrobeItem: true } } },
    });

    const score = calculateCompatibility(wardrobeItems, occasion);

    return NextResponse.json(
      { success: true, message: "Outfit created", data: { ...outfit, score } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Outfit create error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}