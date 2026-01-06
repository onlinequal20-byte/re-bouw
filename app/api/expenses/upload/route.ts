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
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, WebP and PDF are allowed" },
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
    const buffer = Buffer.from(new Uint8Array(bytes));

    // Optimize image if it's an image
    let processedBuffer: Buffer = buffer as unknown as Buffer;
    let contentType = file.type;

    if (file.type.startsWith("image/")) {
      processedBuffer = await sharp(buffer as any)
        .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
      contentType = "image/jpeg";
    }

    // Upload to Supabase Storage
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}-${originalName}`;
    const filePath = `receipts/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(filePath, processedBuffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file to storage" },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("receipts")
      .getPublicUrl(filePath);

    // Perform OCR (only for images)
    let ocrText = null;
    let ocrBedrag = null;
    let ocrDatum = null;
    let ocrWinkel = null;

    if (file.type.startsWith("image/")) {
      try {
        const worker = await createWorker("nld+eng"); // Dutch + English
        const { data: { text } } = await worker.recognize(processedBuffer);
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
        imageUrl: publicUrl,
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
