import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const startTime = Date.now();

    // Query PostgreSQL to verify database connectivity
    const [userCount, productCount, categoryCount] = await Promise.all([
      db.user.count(),
      db.product.count(),
      db.category.count(),
    ]);

    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        latencyMs,
        provider: "PostgreSQL (Docker: cyberguard-postgres)",
        databaseName: "presty_motors",
        counts: {
          users: userCount,
          products: productCount,
          categories: categoryCount,
        },
      },
      environment: process.env.NODE_ENV,
      version: "1.0.0",
    });
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
          error: error instanceof Error ? error.message : "Unknown database error",
        },
      },
      { status: 500 }
    );
  }
}
