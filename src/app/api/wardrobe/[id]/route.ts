import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
import { wardrobeItemSchema } from "@/lib/validations/wardrobe";

async function getOwnedItem(itemId: string, userId: string) {
  const item = await prisma.wardrobeItem.findUnique({ where: { id: itemId } });
  if (!item || item.userId !== userId) return null;
  return item;
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
  const item = await getOwnedItem(id, session.user.id);

  if (!item) {
    return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: item });
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
    const existing = await getOwnedItem(id, session.user.id);

    if (!existing) {
      return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
    }

    const body = await request.json();

    // Allow a lightweight favorite toggle without full validation
    if (typeof body.isFavorite === "boolean" && Object.keys(body).length === 1) {
      const updated = await prisma.wardrobeItem.update({
        where: { id },
        data: { isFavorite: body.isFavorite },
      });
      return NextResponse.json({ success: true, message: "Updated", data: updated });
    }

    const parsed = wardrobeItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await prisma.wardrobeItem.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, message: "Item updated", data: updated });
  } catch (error) {
    console.error("Wardrobe update error:", error);
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
    const existing = await getOwnedItem(id, session.user.id);

    if (!existing) {
      return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
    }

    await cloudinary.uploader.destroy(existing.imagePublicId);
    await prisma.wardrobeItem.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Item deleted" });
  } catch (error) {
    console.error("Wardrobe delete error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}