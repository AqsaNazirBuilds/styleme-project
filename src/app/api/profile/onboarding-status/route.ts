import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "You must be signed in" }, { status: 401 });
  }

  const stylePreference = await prisma.stylePreference.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ success: true, data: { completed: !!stylePreference } });
}