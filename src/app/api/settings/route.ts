import { NextRequest } from "next/server";
import { settingsSchema } from "@/lib/schemas";
import { handleError, withUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const defaults = {
  dayStartMin: 6 * 60,
  dayEndMin: 23 * 60,
  timerRoundingMin: 0 as const,
};

export async function GET() {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  const settings =
    (await prisma.userSettings.findUnique({
      where: { userId: auth.user.id },
    })) ?? defaults;

  return Response.json({ settings });
}

export async function PATCH(request: NextRequest) {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  try {
    const body = settingsSchema.parse(await request.json());

    const settings = await prisma.userSettings.upsert({
      where: { userId: auth.user.id },
      create: {
        userId: auth.user.id,
        ...body,
      },
      update: body,
    });

    return Response.json({ settings });
  } catch (error) {
    return handleError(error);
  }
}



