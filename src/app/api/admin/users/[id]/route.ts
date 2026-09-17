import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  if (id === session.user.id) {
    return NextResponse.json(
      { success: false, message: "You cannot suspend your own account" },
      { status: 400 }
    );
  }

  if (typeof body.suspended !== "boolean") {
    return NextResponse.json({ success: false, message: "Invalid input" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { suspended: body.suspended },
  });

  return NextResponse.json({ success: true, data: user });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  if (id === session.user.id) {
    return NextResponse.json(
      { success: false, message: "You cannot delete your own account" },
      { status: 400 }
    );
  }

  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ success: true, message: "User deleted" });
}