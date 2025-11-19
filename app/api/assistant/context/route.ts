
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";


export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const context = await prisma.businessContext.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json(context || {});
  } catch (error) {
    console.error("Get context error:", error);
    return NextResponse.json(
      { error: "Failed to fetch context" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const context = await prisma.businessContext.upsert({
      where: { userId: user.id },
      update: {
        ...data,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        ...data,
      },
    });

    return NextResponse.json(context);
  } catch (error) {
    console.error("Update context error:", error);
    return NextResponse.json(
      { error: "Failed to update context" },
      { status: 500 }
    );
  }
}
