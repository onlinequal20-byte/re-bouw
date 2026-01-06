import { NextResponse } from "next/server";
import { getSession } from "@/lib/simple-auth";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import { join } from "path";
import sharp from "sharp";
import { createWorker } from "tesseract.js";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const klantId = formData.get("klantId") as string | null;
    const offerteId = formData.get("offerteId") as string | null;
    const factuurId = formData.get("factuurId") as string | null;
    const categorie = formData.get("categorie") as string;
    const omschrijving = formData.get("omschrijving") as string;
    const uploadedVia = formData.get("uploadedVia") as string || "web";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, and WebP are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}-${originalName}`;
    const filepath = join(process.cwd(), "public", "uploads", "receipts", filename);

    // Optimize and save image
    await sharp(buffer)
      .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(filepath);

    const imageUrl = `/uploads/receipts/${filename}`;

    // Perform OCR
    let ocrText = null;
    let ocrBedrag = null;
    let ocrDatum = null;
    let ocrWinkel = null;

    try {
      const worker = await createWorker("nld+eng"); // Dutch + English
      const { data: { text } } = await worker.recognize(buffer);
      await worker.terminate();

      ocrText = text;

      // Extract amount (look for patterns like €12.34, 12,34, EUR 12.34)
      const amountRegex = /(?:€|EUR)?\s*(\d+)[.,](\d{2})/g;
      const amounts: number[] = [];
      let match;
      while ((match = amountRegex.exec(text)) !== null) {
        const amount = parseFloat(`${match[1]}.${match[2]}`);
        if (amount > 0 && amount < 100000) {
          amounts.push(amount);
        }
      }
      // Use the largest amount found (usually the total)
      if (amounts.length > 0) {
        ocrBedrag = Math.max(...amounts);
      }

      // Extract date (DD-MM-YYYY, DD/MM/YYYY, etc.)
      const dateRegex = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/;
      const dateMatch = text.match(dateRegex);
      if (dateMatch) {
        const day = parseInt(dateMatch[1]);
        const month = parseInt(dateMatch[2]) - 1;
        let year = parseInt(dateMatch[3]);
        if (year < 100) year += 2000;
        ocrDatum = new Date(year, month, day);
      }

      // Extract store name (first line usually)
      const lines = text.split("\n").filter((line) => line.trim().length > 0);
      if (lines.length > 0) {
        ocrWinkel = lines[0].trim().substring(0, 100);
      }
    } catch (ocrError) {
      console.error("OCR error:", ocrError);
      // Continue without OCR data
    }

    // Calculate totals
    const bedrag = ocrBedrag || 0;
    const btw = bedrag * 0.21; // 21% BTW
    const totaalBedrag = bedrag + btw;

    // Create expense record
    const expense = await prisma.expense.create({
      data: {
        klantId: klantId || undefined,
        offerteId: offerteId || undefined,
        factuurId: factuurId || undefined,
        datum: ocrDatum || new Date(),
        categorie: categorie || "Overig",
        omschrijving: omschrijving || ocrWinkel || "Bonnetje",
        bedrag,
        btw,
        totaalBedrag,
        imageUrl,
        imageName: file.name,
        imageSize: file.size,
        ocrText,
        ocrBedrag,
        ocrDatum,
        ocrWinkel,
        ocrVerified: false,
        uploadedVia,
        status: "pending",
      },
      include: {
        klant: true,
        offerte: true,
        factuur: true,
      },
    });

    return NextResponse.json({
      success: true,
      expense,
      message: "Bonnetje succesvol geüpload en verwerkt",
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}

