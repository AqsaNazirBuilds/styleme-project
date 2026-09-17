import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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
    const event = await prisma.calendarEvent.findUnique({ where: { id } });

    if (!event || event.userId !== session.user.id) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
    }

    await prisma.calendarEvent.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Removed from planner" });
  } catch (error) {
    console.error("Calendar delete error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}