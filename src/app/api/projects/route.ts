import { NextRequest } from "next/server";
import { projectSchema } from "@/lib/schemas";
import { handleError, withUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  const areaId = request.nextUrl.searchParams.get("areaId");

  const projects = await prisma.project.findMany({
    where: {
      userId: auth.user.id,
      ...(areaId ? { areaId } : {}),
    },
    orderBy: { order: "asc" },
    include: {
      area: true,
      tasks: {
        where: { archived: false },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return Response.json({ projects });
}

export async function POST(request: NextRequest) {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  try {
    const body = projectSchema.parse(await request.json());

    const last = await prisma.project.findFirst({
      where: { userId: auth.user.id, areaId: body.areaId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const project = await prisma.project.create({
      data: {
        userId: auth.user.id,
        areaId: body.areaId,
        name: body.name,
        order: body.order ?? (last?.order ?? -1) + 1,
      },
    });

    return Response.json({ project }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}



