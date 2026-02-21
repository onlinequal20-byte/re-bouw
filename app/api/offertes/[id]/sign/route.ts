import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendEmail, generateOfferteSignedConfirmationEmail } from "@/lib/email/email-service";

const signSchema = z.object({
  signature: z.string().min(1, "Handtekening is verplicht"),
  naam: z.string().min(1, "Naam is verplicht"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { signature, naam } = signSchema.parse(body);

    // Get client IP address
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown";

    // Check if offerte exists
    const offerte = await prisma.offerte.findUnique({
      where: { id: id },
    });

    if (!offerte) {
      return NextResponse.json(
        { error: "Offerte niet gevonden" },
        { status: 404 }
      );
    }

    // Check if already signed
    if (offerte.klantHandtekening) {
      return NextResponse.json(
        { error: "Offerte is al ondertekend" },
        { status: 400 }
      );
    }

    // Update offerte with signature
    const updated = await prisma.offerte.update({
      where: { id: id },
      data: {
        klantHandtekening: signature,
        klantNaam: naam,
        klantGetekendOp: new Date(),
        klantIpAdres: ip,
        status: "Getekend",
        algemeneVoorwaardenUrl: "/algemene-voorwaarden.txt",
      },
      include: {
        klant: { select: { naam: true, email: true } },
      },
    });

    // Send confirmation email to client
    if (updated.klant?.email) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://dashboard.re-bouw.nl';
        const { subject, body } = generateOfferteSignedConfirmationEmail(updated, baseUrl);
        await sendEmail({ to: updated.klant.email, subject, body });

        // Log the email
        await prisma.email.create({
          data: {
            type: 'offerte',
            documentId: updated.id,
            documentNummer: updated.offerteNummer,
            recipient: updated.klant.email,
            recipientName: updated.klant.naam,
            subject,
            body,
            status: 'verzonden',
            sentAt: new Date(),
          },
        });
      } catch (emailError) {
        console.error("Failed to send signing confirmation email:", emailError);
        // Don't fail the signing if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Offerte succesvol ondertekend",
      offerte: updated,
    });
  } catch (error) {
    console.error("Error signing offerte:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Ongeldige gegevens", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Er is een fout opgetreden bij het ondertekenen" },
      { status: 500 }
    );
  }
}

