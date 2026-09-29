import { NextRequest } from "next/server";
import { taskSchema } from "@/lib/schemas";
import { handleError, withUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  const projectId = request.nextUrl.searchParams.get("projectId");

  const tasks = await prisma.task.findMany({
    where: {
      userId: auth.user.id,
      archived: false,
      ...(projectId ? { projectId } : {}),
    },
    include: {
      project: {
        include: {
          area: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return Response.json({ tasks });
}

export async function POST(request: NextRequest) {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  try {
    const body = taskSchema.parse(await request.json());

    const project = await prisma.project.findFirst({
      where: { id: body.projectId, userId: auth.user.id },
      select: { id: true },
    });
    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    const task = await prisma.task.create({
      data: {
        userId: auth.user.id,
        projectId: body.projectId,
        title: body.title,
        notes: body.notes ?? null,
        tags: body.tags ?? [],
        defaultEstimateMin: body.defaultEstimateMin ?? 30,
        archived: body.archived ?? false,
      },
    });

    return Response.json({ task }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}



