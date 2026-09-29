import { NextRequest } from "next/server";
import { handleError, withUser } from "@/lib/api";
import { syncSchema } from "@/lib/schemas";
import { replaySyncMutations } from "@/lib/sync";

export async function POST(request: NextRequest) {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  try {
    const body = syncSchema.parse(await request.json());
    const ownedMutations = body.mutations.filter((mutation) => mutation.userId === auth.user!.id);

    const result = await replaySyncMutations(ownedMutations);

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}



