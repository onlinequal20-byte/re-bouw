import { NextResponse } from "next/server";
import { getSession } from "@/lib/simple-auth";
import { prisma } from "@/lib/prisma";
import { settingsSchema } from "@/lib/validations/settings";
import { handleApiError, validationError } from "@/lib/api-error";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const settings = await prisma.settings.findMany();

    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(settingsMap);
  } catch (error: unknown) {
    return handleApiError(error, "instellingen ophalen");
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const body = await request.json();
    const result = settingsSchema.safeParse(body);

    if (!result.success) {
      return validationError(
        Object.fromEntries(
          Object.entries(result.error.flatten().fieldErrors).map(([k, v]) => [k, v ?? []])
        )
      );
    }

    // Update or create each setting
    for (const [key, value] of Object.entries(result.data)) {
      if (value !== undefined) {
        await prisma.settings.upsert({
          where: { key },
          update: { value: value as string },
          create: { key, value: value as string },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return handleApiError(error, "instellingen bijwerken");
  }
}
