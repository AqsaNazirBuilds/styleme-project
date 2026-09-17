import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { selectOutfitForStyleMe } from "@/lib/scoring/style-me";
import { calculateCompatibility } from "@/lib/scoring/compatibility";
import { generateStyleExplanation } from "@/lib/ai/gemini";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "You must be signed in" }, { status: 401 });
    }

    const rateLimit = checkRateLimit(`style-me:${session.user.id}`, 10, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: "Too many requests. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { occasion, style } = body;

    if (!occasion || !style) {
      return NextResponse.json(
        { success: false, message: "Occasion and style are required" },
        { status: 400 }
      );
    }

    const wardrobe = await prisma.wardrobeItem.findMany({
      where: { userId: session.user.id },
    });

    if (wardrobe.length < 2) {
      return NextResponse.json(
        { success: false, message: "Add at least 2 wardrobe items to use Style Me" },
        { status: 400 }
      );
    }

    const selectedItems = selectOutfitForStyleMe(wardrobe, occasion, style);

    if (selectedItems.length < 2) {
      return NextResponse.json(
        { success: false, message: "Couldn't find enough matching items. Try adding more wardrobe variety." },
        { status: 400 }
      );
    }

    const score = calculateCompatibility(selectedItems, occasion);

    const aiResult = await generateStyleExplanation({
      items: selectedItems.map((i) => ({ name: i.name, category: i.category, color: i.color })),
      occasion,
      style,
      score: score.overall,
    });

    const isFallback = aiResult === null;
    const explanation = aiResult?.explanation ?? `This ${style.toLowerCase()} combination works well together for a ${occasion.toLowerCase()} occasion based on your wardrobe.`;
    const tips = aiResult?.tips ?? "Add a statement accessory to elevate the look.";

    return NextResponse.json({
      success: true,
      data: {
        items: selectedItems,
        occasion,
        style,
        score,
        explanation,
        tips,
        isFallback,
      },
    });
  } catch (error) {
    console.error("Style Me error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}