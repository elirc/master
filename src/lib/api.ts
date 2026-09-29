import { ZodError } from "zod";
import { requireUser } from "@/lib/auth";
import { json } from "@/lib/utils";

export async function withUser() {
  const user = await requireUser();
  if (!user) {
    return { user: null, response: json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user, response: null };
}

export function handleError(error: unknown) {
  if (error instanceof ZodError) {
    return json(
      {
        error: "Validation failed",
        issues: error.issues,
      },
      { status: 400 },
    );
  }

  if (error instanceof Error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json({ error: "Unknown error" }, { status: 500 });
}



