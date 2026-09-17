import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calendarEventSchema } from "@/lib/validations/calendar";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "You must be signed in" }, { status: 401 });
  }

  const events = await prisma.calendarEvent.findMany({
    where: { userId: session.user.id },
    include: { outfit: { include: { items: { include: { wardrobeItem: true } } } } },
    orderBy: { date: "asc" },
  });

  return NextResponse.json({ success: true, data: events });
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "You must be signed in" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = calendarEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { outfitId, date, occasion, notes } = parsed.data;

    const outfit = await prisma.outfit.findUnique({ where: { id: outfitId } });

    if (!outfit || outfit.userId !== session.user.id) {
      return NextResponse.json({ success: false, message: "Outfit not found" }, { status: 404 });
    }

       const event = await prisma.calendarEvent.create({
      data: {
        userId: session.user.id,
        outfitId,
        date: new Date(date),
        occasion,
        notes,
      },
      include: { outfit: { include: { items: { include: { wardrobeItem: true } } } } },
    });

    return NextResponse.json(
      { success: true, message: "Outfit scheduled", data: event },
      { status: 201 }
    );
  } catch (error) {
    console.error("Calendar create error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}