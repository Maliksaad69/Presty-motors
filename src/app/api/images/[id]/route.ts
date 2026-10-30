import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return new NextResponse("Missing image id", { status: 400 });
    }

    const image = await db.productImage.findUnique({
      where: { id },
      select: {
        imageData: true,
        mimeType: true,
      },
    });

    if (!image || !image.imageData) {
      return new NextResponse("Image not found in database", { status: 404 });
    }

    // Convert to Buffer if needed
    const buffer = Buffer.isBuffer(image.imageData)
      ? image.imageData
      : Buffer.from(image.imageData);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": image.mimeType || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error serving image from PostgreSQL:", error);
    return new NextResponse("Error serving image", { status: 500 });
  }
}
