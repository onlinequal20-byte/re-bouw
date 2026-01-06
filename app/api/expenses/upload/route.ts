import { NextResponse } from "next/server";
import { getSession } from "@/lib/simple-auth";
import { prisma } from "@/lib/prisma";
import sharp from "sharp";
import { createWorker } from "tesseract.js";
import { supabase } from "@/lib/supabase";

export const maxDuration = 60; // Max duration for Vercel serverless function (60 seconds)

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd. Log opnieuw in." }, { status: 401 });
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
      return NextResponse.json({ error: "Geen bestand geselecteerd" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Ongeldig bestandstype. Alleen JPG, PNG, WebP en PDF zijn toegestaan." },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Bestand te groot. Maximum grootte is 10MB." },
        { status: 400 }
      );
    }

    console.log("📁 File received:", file.name, file.type, `${(file.size / 1024).toFixed(2)} KB`);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(bytes));

    // Optimize image if it's an image
    let processedBuffer: Buffer = buffer as unknown as Buffer;
    let contentType = file.type;

    if (file.type.startsWith("image/")) {
      try {
        console.log("🖼️  Optimizing image...");
        processedBuffer = await sharp(buffer as any)
          .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer();
        contentType = "image/jpeg";
        console.log("✅ Image optimized");
      } catch (sharpError) {
        console.error("⚠️  Sharp optimization failed, using original:", sharpError);
        // Continue with original buffer if optimization fails
      }
    }

    // Convert to base64 data URL for storage in database
    const timestamp = Date.now();
    const base64Data = processedBuffer.toString('base64');
    const dataUrl = `data:${contentType};base64,${base64Data}`;
    
    console.log("✅ Image converted to base64, size:", (base64Data.length / 1024).toFixed(2), "KB");

    // Perform OCR (only for images)
    let ocrText = null;
    let ocrBedrag = null;
    let ocrDatum = null;
    let ocrWinkel = null;

    if (file.type.startsWith("image/")) {
      try {
        console.log("🔍 Starting OCR...");
        const worker = await createWorker("nld+eng"); // Dutch + English
        const { data: { text } } = await worker.recognize(processedBuffer);
        await worker.terminate();

        ocrText = text;
        console.log("✅ OCR completed, text length:", text.length);

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
          console.log("💰 OCR detected amount:", ocrBedrag);
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
          console.log("📅 OCR detected date:", ocrDatum);
        }

        // Extract store name (first line usually)
        const lines = text.split("\n").filter((line) => line.trim().length > 0);
        if (lines.length > 0) {
          ocrWinkel = lines[0].trim().substring(0, 100);
          console.log("🏪 OCR detected store:", ocrWinkel);
        }
      } catch (ocrError) {
        console.error("⚠️  OCR error (continuing without OCR data):", ocrError);
        // Continue without OCR data
      }
    }

    // Calculate totals
    const bedrag = ocrBedrag || 0;
    const btw = bedrag * 0.21; // 21% BTW
    const totaalBedrag = bedrag + btw;

    console.log("💾 Saving to database...");

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
        imageUrl: dataUrl,
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

    console.log("✅ Expense created:", expense.id);

    return NextResponse.json({
      success: true,
      expense,
      message: "Bonnetje succesvol geüpload en verwerkt",
    });
  } catch (error: any) {
    console.error("❌ Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload mislukt. Probeer het opnieuw." },
      { status: 500 }
    );
  }
}
