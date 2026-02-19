import { NextResponse } from "next/server";
import { getSession } from "@/lib/simple-auth";
import { prisma } from "@/lib/prisma";
import sharp from "sharp";
// OCR disabled for Vercel compatibility
// import { createWorker } from "tesseract.js";
import { supabase } from "@/lib/supabase";
import { handleApiError } from "@/lib/api-error";

export const maxDuration = 30; // Reduced timeout since OCR is disabled

export async function POST(request: Request) {
  try {
    console.log("🚀 Upload started");
    const session = await getSession();
    if (!session) {
      console.error("❌ No session");
      return NextResponse.json({ error: "Niet geautoriseerd. Log opnieuw in." }, { status: 401 });
    }
    console.log("✅ Session OK");

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const klantId = formData.get("klantId") as string | null;
    const offerteId = formData.get("offerteId") as string | null;
    const factuurId = formData.get("factuurId") as string | null;
    const categorie = formData.get("categorie") as string;
    const omschrijving = formData.get("omschrijving") as string;
    const bedragInput = formData.get("bedrag") as string;
    const uploadedVia = formData.get("uploadedVia") as string || "web";

    if (!file) {
      console.error("❌ No file");
      return NextResponse.json({ error: "Geen bestand geselecteerd" }, { status: 400 });
    }
    console.log("✅ File OK");

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      console.error("❌ Invalid file type:", file.type);
      return NextResponse.json(
        { error: "Ongeldig bestandstype. Alleen JPG, PNG, WebP en PDF zijn toegestaan." },
        { status: 400 }
      );
    }
    console.log("✅ File type OK");

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

    // Upload to Supabase Storage
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}-${originalName}`;
    const filePath = `${filename}`;

    console.log("☁️  Uploading to Supabase Storage...");

    const { error: uploadError, data: uploadData } = await supabase.storage
      .from("receipts")
      .upload(filePath, processedBuffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error("❌ Supabase upload error:", uploadError);
      console.error("Error details:", JSON.stringify(uploadError, null, 2));
      return NextResponse.json(
        { error: "Upload naar opslag mislukt" },
        { status: 500 }
      );
    }

    console.log("✅ Upload successful:", uploadData);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("receipts")
      .getPublicUrl(filePath);

    console.log("🔗 Public URL:", publicUrl);

    // OCR is disabled for Vercel compatibility (60s timeout issue)
    // Users can manually enter the amount and description
    let ocrText = null;
    let ocrBedrag = null;
    let ocrDatum = null;
    let ocrWinkel = null;
    
    console.log("ℹ️  OCR skipped - manual entry required");

    // Calculate totals from user input
    // Calculate totals — store as integer cents
    const bedragEuros = parseFloat(bedragInput) || 0;
    const bedrag = Math.round(bedragEuros * 100);
    const btw = Math.round(bedrag * 0.21); // 21% BTW in cents
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

    console.log("✅ Expense created:", expense.id);

    return NextResponse.json({
      success: true,
      expense,
      message: "Bonnetje succesvol geüpload en verwerkt",
    });
  } catch (error: unknown) {
    return handleApiError(error, "uploaden van bonnetje");
  }
}
