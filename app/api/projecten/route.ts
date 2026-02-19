import { NextResponse } from "next/server";
import { getSession } from "@/lib/simple-auth";
import { prisma } from "@/lib/prisma";
import { generateProjectNummer } from "@/lib/number-generator";
import { projectCreateSchema } from "@/lib/validations/project";
import { handleApiError, validationError } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const klantId = searchParams.get("klantId");
    const status = searchParams.get("status");

    const where: any = {};
    if (klantId) where.klantId = klantId;
    if (status) where.status = status;

    const projecten = await prisma.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        klant: { select: { id: true, naam: true } },
        _count: { select: { offertes: true, facturen: true, expenses: true } },
      },
    });

    return NextResponse.json(projecten);
  } catch (error: unknown) {
    return handleApiError(error, "projecten ophalen");
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const body = await request.json();
    const result = projectCreateSchema.safeParse(body);

    if (!result.success) {
      return validationError(
        Object.fromEntries(
          Object.entries(result.error.flatten().fieldErrors).map(([k, v]) => [k, v ?? []])
        )
      );
    }

    const data = result.data;
    const projectNummer = await generateProjectNummer();

    const project = await prisma.project.create({
      data: {
        projectNummer,
        naam: data.naam,
        locatie: data.locatie || null,
        klantId: data.klantId,
        status: data.status || "Actief",
        notities: data.notities || null,
      },
      include: {
        klant: true,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error: unknown) {
    return handleApiError(error, "project aanmaken");
  }
}
