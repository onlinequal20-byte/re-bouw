import { NextResponse } from "next/server";
import { getSession } from "@/lib/simple-auth";
import { prisma } from "@/lib/prisma";
import { projectUpdateSchema } from "@/lib/validations/project";
import { handleApiError, validationError } from "@/lib/api-error";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        klant: true,
        offertes: {
          orderBy: { datum: "desc" },
          include: { items: true },
        },
        facturen: {
          orderBy: { datum: "desc" },
          include: { items: true },
        },
        expenses: {
          orderBy: { datum: "desc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project niet gevonden" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error: unknown) {
    return handleApiError(error, "project ophalen");
  }
}

export async function PUT(
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
    const result = projectUpdateSchema.safeParse(body);

    if (!result.success) {
      return validationError(
        Object.fromEntries(
          Object.entries(result.error.flatten().fieldErrors).map(([k, v]) => [k, v ?? []])
        )
      );
    }

    const data = result.data;

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(data.naam !== undefined && { naam: data.naam }),
        ...(data.locatie !== undefined && { locatie: data.locatie || null }),
        ...(data.klantId !== undefined && { klantId: data.klantId }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.notities !== undefined && { notities: data.notities || null }),
      },
      include: {
        klant: true,
      },
    });

    return NextResponse.json(project);
  } catch (error: unknown) {
    return handleApiError(error, "project bijwerken");
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ message: "Project verwijderd" });
  } catch (error: unknown) {
    return handleApiError(error, "project verwijderen");
  }
}
