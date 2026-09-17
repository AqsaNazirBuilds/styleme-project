import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { geocodeLocation, getWeatherForecast } from "@/lib/weather/open-meteo";
import { buildPackingList } from "@/lib/scoring/packing";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "You must be signed in" }, { status: 401 });
    }

    const rateLimit = checkRateLimit(`packing:${session.user.id}`, 10, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: "Too many requests. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { destination, days, occasion } = body;

    if (!destination || !days || !occasion) {
      return NextResponse.json(
        { success: false, message: "Destination, days, and occasion are required" },
        { status: 400 }
      );
    }

    const wardrobe = await prisma.wardrobeItem.findMany({
      where: { userId: session.user.id },
    });

    if (wardrobe.length === 0) {
      return NextResponse.json(
        { success: false, message: "Add some wardrobe items first" },
        { status: 400 }
      );
    }

    let weather = null;
    const location = await geocodeLocation(destination);
    if (location) {
      weather = await getWeatherForecast(location.latitude, location.longitude);
    }

    const result = buildPackingList(wardrobe, Number(days), occasion, weather);

    return NextResponse.json({
      success: true,
      data: {
        destination,
        days: Number(days),
        occasion,
        weatherAvailable: weather !== null,
        ...result,
      },
    });
  } catch (error) {
    console.error("Packing assistant error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}