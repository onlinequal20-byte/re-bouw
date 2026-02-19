import { getSession } from "@/lib/simple-auth";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-error";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { titel, startDatum, eindDatum, projectId, notities, kleurCode } = body;

    const item = await prisma.planningItem.update({
      where: { id },
      data: {
        ...(titel !== undefined && { titel }),
        ...(startDatum !== undefined && { startDatum: new Date(startDatum) }),
        ...(eindDatum !== undefined && { eindDatum: new Date(eindDatum) }),
        ...(projectId !== undefined && { projectId: projectId || null }),
        ...(notities !== undefined && { notities: notities || null }),
        ...(kleurCode !== undefined && { kleurCode }),
      },
      include: {
        project: {
          include: {
            klant: { select: { naam: true } },
          },
        },
      },
    });

    return Response.json(item);
  } catch (error) {
    return handleApiError(error, "planning");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.planningItem.delete({ where: { id } });

    return Response.json({ success: true });
  } catch (error) {
    return handleApiError(error, "planning");
  }
}
