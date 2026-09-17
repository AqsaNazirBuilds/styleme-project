import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stylePreferenceSchema } from "@/lib/validations/style-preference";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "You must be signed in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = stylePreferenceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { favoriteStyles, preferredColors, favoriteCategories, preferredOccasions } =
      parsed.data;

    const preference = await prisma.stylePreference.upsert({
      where: { userId: session.user.id },
      update: { favoriteStyles, preferredColors, favoriteCategories, preferredOccasions },
      create: {
        userId: session.user.id,
        favoriteStyles,
        preferredColors,
        favoriteCategories,
        preferredOccasions,
      },
    });

    return NextResponse.json(
      { success: true, message: "Preferences saved", data: preference },
      { status: 200 }
    );
  } catch (error) {
    console.error("Style preference error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}