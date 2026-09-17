import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateStylistReply } from "@/lib/ai/stylist";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "You must be signed in" }, { status: 401 });
  }

  const conversation = await prisma.aIConversation.findFirst({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  return NextResponse.json({ success: true, data: conversation });
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "You must be signed in" }, { status: 401 });
    }

    const rateLimit = checkRateLimit(`ai-stylist:${session.user.id}`, 15, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: "Too many requests. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { message, conversationId } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ success: false, message: "Message is required" }, { status: 400 });
    }

    if (message.length > 1000) {
      return NextResponse.json({ success: false, message: "Message is too long" }, { status: 400 });
    }

    let conversation;

    if (conversationId) {
      conversation = await prisma.aIConversation.findUnique({
        where: { id: conversationId },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });

      if (!conversation || conversation.userId !== session.user.id) {
        return NextResponse.json({ success: false, message: "Conversation not found" }, { status: 404 });
      }
    } else {
      conversation = await prisma.aIConversation.create({
        data: { userId: session.user.id },
        include: { messages: true },
      });
    }

    await prisma.aIMessage.create({
      data: { conversationId: conversation.id, role: "user", content: message },
    });

    const history = [
      ...conversation.messages.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];

    const reply = await generateStylistReply(history);

    const isFallback = reply === null;
    const finalReply =
      reply ??
      "I'm having trouble connecting right now. In the meantime, try pairing neutral tones together for an easy, put-together look.";

    await prisma.aIMessage.create({
      data: { conversationId: conversation.id, role: "assistant", content: finalReply },
    });

    return NextResponse.json({
      success: true,
      data: { conversationId: conversation.id, reply: finalReply, isFallback },
    });
  } catch (error) {
    console.error("AI Stylist chat error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}