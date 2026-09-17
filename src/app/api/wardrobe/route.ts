import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
import {
  wardrobeItemSchema,
  MAX_IMAGE_SIZE,
  ALLOWED_IMAGE_TYPES,
} from "@/lib/validations/wardrobe";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "You must be signed in" },
      { status: 401 }
    );
  }

  const items = await prisma.wardrobeItem.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: items });
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "You must be signed in" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json(
        { success: false, message: "An image is required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_IMAGE_TYPES.includes(imageFile.type)) {
      return NextResponse.json(
        { success: false, message: "Only JPEG, PNG, or WEBP images are allowed" },
        { status: 400 }
      );
    }

    if (imageFile.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { success: false, message: "Image must be under 5MB" },
        { status: 400 }
      );
    }

    const fields = {
      name: formData.get("name") as string,
      category: formData.get("category") as string,
      subcategory: (formData.get("subcategory") as string) || undefined,
      color: formData.get("color") as string,
      secondColor: (formData.get("secondColor") as string) || undefined,
      pattern: (formData.get("pattern") as string) || undefined,
      material: (formData.get("material") as string) || undefined,
      season: (formData.get("season") as string) || undefined,
      occasion: (formData.get("occasion") as string) || undefined,
      style: (formData.get("style") as string) || undefined,
      brand: (formData.get("brand") as string) || undefined,
      notes: (formData.get("notes") as string) || undefined,
    };

    const parsed = wardrobeItemSchema.safeParse(fields);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${imageFile.type};base64,${buffer.toString("base64")}`;

    const uploadResult = await cloudinary.uploader.upload(base64, {
      folder: `styleme/wardrobe/${session.user.id}`,
    });

    const item = await prisma.wardrobeItem.create({
      data: {
        ...parsed.data,
        userId: session.user.id,
        imageUrl: uploadResult.secure_url,
        imagePublicId: uploadResult.public_id,
      },
    });

    return NextResponse.json(
      { success: true, message: "Item added to wardrobe", data: item },
      { status: 201 }
    );
  } catch (error) {
    console.error("Wardrobe create error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}