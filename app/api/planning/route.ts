import { getSession } from "@/lib/simple-auth";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!start || !end) {
      return Response.json(
        { error: "start en end parameters zijn verplicht" },
        { status: 400 }
      );
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    const items = await prisma.planningItem.findMany({
      where: {
        OR: [
          { startDatum: { gte: startDate, lt: endDate } },
          { eindDatum: { gt: startDate, lte: endDate } },
          { startDatum: { lte: startDate }, eindDatum: { gte: endDate } },
        ],
      },
      include: {
        project: {
          include: {
            klant: { select: { naam: true } },
          },
        },
      },
      orderBy: { startDatum: "asc" },
    });

    return Response.json(items);
  } catch (error) {
    return handleApiError(error, "planning");
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const body = await request.json();
    const { titel, startDatum, eindDatum, projectId, notities, kleurCode } = body;

    if (!titel || !startDatum || !eindDatum) {
      return Response.json(
        { error: "Titel, startDatum en eindDatum zijn verplicht" },
        { status: 400 }
      );
    }

    const item = await prisma.planningItem.create({
      data: {
        titel,
        startDatum: new Date(startDatum),
        eindDatum: new Date(eindDatum),
        projectId: projectId || null,
        notities: notities || null,
        kleurCode: kleurCode || "#3b82f6",
      },
      include: {
        project: {
          include: {
            klant: { select: { naam: true } },
          },
        },
      },
    });

    return Response.json(item, { status: 201 });
  } catch (error) {
    return handleApiError(error, "planning");
  }
}
