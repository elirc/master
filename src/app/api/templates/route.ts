import { NextRequest } from "next/server";
import { templateSchema } from "@/lib/schemas";
import { handleError, withUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  const templates = await prisma.template.findMany({
    where: { userId: auth.user.id },
    orderBy: { createdAt: "asc" },
  });

  return Response.json({ templates });
}

export async function POST(request: NextRequest) {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  try {
    const body = templateSchema.parse(await request.json());

    const template = await prisma.template.create({
      data: {
        userId: auth.user.id,
        name: body.name,
        weekdayMask: body.weekdayMask ?? [],
        dayTaskTemplate: body.dayTaskTemplate,
        scheduleTemplate: body.scheduleTemplate,
      },
    });

    return Response.json({ template }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}



