import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/simple-auth";
import { prisma } from "@/lib/prisma";
import { klantUpdateSchema } from "@/lib/validations/klant";
import { handleApiError, validationError } from "@/lib/api-error";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const klant = await prisma.klant.findUnique({
      where: { id },
      include: {
        projecten: {
          orderBy: { createdAt: "desc" },
        },
        offertes: {
          orderBy: { datum: "desc" },
        },
        facturen: {
          orderBy: { datum: "desc" },
        },
        expenses: {
          orderBy: { datum: "desc" },
        },
      },
    });

    if (!klant) {
      return NextResponse.json({ error: "Klant niet gevonden" }, { status: 404 });
    }

    // Get emails related to this klant's documents
    const documentIds = [
      ...klant.offertes.map(o => o.id),
      ...klant.facturen.map(f => f.id),
    ];

    const emails = documentIds.length > 0
      ? await prisma.email.findMany({
          where: { documentId: { in: documentIds } },
          orderBy: { sentAt: "desc" },
        })
      : [];

    return NextResponse.json({ ...klant, emails });
  } catch (error: unknown) {
    return handleApiError(error, "klant ophalen");
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const body = await request.json();
    const result = await klantUpdateSchema.safeParseAsync(body);

    if (!result.success) {
      return validationError(
        Object.fromEntries(
          Object.entries(result.error.flatten().fieldErrors).map(([k, v]) => [k, v ?? []])
        )
      );
    }

    const klant = await prisma.klant.update({
      where: { id },
      data: result.data,
    });

    revalidatePath("/klanten");
    revalidatePath(`/klanten/${id}`);
    return NextResponse.json(klant);
  } catch (error: unknown) {
    return handleApiError(error, "klant bijwerken");
  }
}
