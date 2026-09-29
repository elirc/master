import { requireUser } from "@/lib/auth";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({
    id: user.id,
    username: user.username,
  });
}



