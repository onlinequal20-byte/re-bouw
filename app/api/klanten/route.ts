import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/simple-auth";
import { prisma } from "@/lib/prisma";
import { klantCreateSchema } from "@/lib/validations/klant";
import { handleApiError, validationError } from "@/lib/api-error";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const klanten = await prisma.klant.findMany({
      orderBy: { naam: "asc" },
    });

    return NextResponse.json(klanten, {
      headers: { "Cache-Control": "private, max-age=30" },
    });
  } catch (error: unknown) {
    return handleApiError(error, "klanten ophalen");
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const body = await request.json();
    const result = await klantCreateSchema.safeParseAsync(body);

    if (!result.success) {
      return validationError(
        Object.fromEntries(
          Object.entries(result.error.flatten().fieldErrors).map(([k, v]) => [k, v ?? []])
        )
      );
    }

    const klant = await prisma.klant.create({
      data: {
        naam: result.data.naam,
        email: result.data.email || null,
        telefoon: result.data.telefoon || null,
        adres: result.data.adres || null,
        postcode: result.data.postcode || null,
        plaats: result.data.plaats || null,
        kvkNummer: result.data.kvkNummer || null,
        notities: result.data.notities || null,
      },
    });

    revalidatePath("/klanten");
    return NextResponse.json(klant, { status: 201 });
  } catch (error: unknown) {
    return handleApiError(error, "klant aanmaken");
  }
}
