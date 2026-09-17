import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function getOwnedOutfit(outfitId: string, userId: string) {
  const outfit = await prisma.outfit.findUnique({
    where: { id: outfitId },
    include: { items: { include: { wardrobeItem: true } } },
  });
  if (!outfit || outfit.userId !== userId) return null;
  return outfit;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "You must be signed in" }, { status: 401 });
  }

  const { id } = await params;
  const outfit = await getOwnedOutfit(id, session.user.id);

  if (!outfit) {
    return NextResponse.json({ success: false, message: "Outfit not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: outfit });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "You must be signed in" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await getOwnedOutfit(id, session.user.id);

    if (!existing) {
      return NextResponse.json({ success: false, message: "Outfit not found" }, { status: 404 });
    }

    const body = await request.json();

    if (typeof body.isFavorite === "boolean") {
      const updated = await prisma.outfit.update({
        where: { id },
        data: { isFavorite: body.isFavorite },
      });
      return NextResponse.json({ success: true, message: "Updated", data: updated });
    }

    return NextResponse.json({ success: false, message: "Invalid input" }, { status: 400 });
  } catch (error) {
    console.error("Outfit update error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "You must be signed in" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await getOwnedOutfit(id, session.user.id);

    if (!existing) {
      return NextResponse.json({ success: false, message: "Outfit not found" }, { status: 404 });
    }

    await prisma.outfit.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Outfit deleted" });
  } catch (error) {
    console.error("Outfit delete error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}