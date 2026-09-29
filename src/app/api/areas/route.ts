import { NextRequest } from "next/server";
import { areaSchema } from "@/lib/schemas";
import { handleError, withUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  const includeNested = request.nextUrl.searchParams.get("include") === "nested";

  const areas = await prisma.area.findMany({
    where: { userId: auth.user.id },
    orderBy: { order: "asc" },
    include: includeNested
      ? {
          projects: {
            orderBy: { order: "asc" },
            include: {
              tasks: {
                where: { archived: false },
                orderBy: { createdAt: "asc" },
              },
            },
          },
        }
      : undefined,
  });

  return Response.json({ areas });
}

export async function POST(request: NextRequest) {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  try {
    const body = areaSchema.parse(await request.json());
    const last = await prisma.area.findFirst({
      where: { userId: auth.user.id },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const area = await prisma.area.create({
      data: {
        userId: auth.user.id,
        name: body.name,
        order: body.order ?? (last?.order ?? -1) + 1,
      },
    });

    return Response.json({ area }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}



