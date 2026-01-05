import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "offerte" or "factuur"
    const limit = parseInt(searchParams.get("limit") || "50");

    const where = type ? { type } : {};

    const emails = await prisma.email.findMany({
      where,
      orderBy: { sentAt: "desc" },
      take: limit,
    });

    return NextResponse.json(emails);
  } catch (error) {
    console.error("Error fetching emails:", error);
    return NextResponse.json(
      { error: "Failed to fetch emails" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      type,
      documentId,
      documentNummer,
      recipient,
      recipientName,
      subject,
      body: emailBody,
      status,
      errorMessage,
    } = body;

    const email = await prisma.email.create({
      data: {
        type,
        documentId,
        documentNummer,
        recipient,
        recipientName,
        subject,
        body: emailBody,
        status: status || "verzonden",
        errorMessage,
      },
    });

    return NextResponse.json(email);
  } catch (error) {
    console.error("Error creating email log:", error);
    return NextResponse.json(
      { error: "Failed to log email" },
      { status: 500 }
    );
  }
}

