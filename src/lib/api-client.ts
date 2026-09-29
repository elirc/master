export async function apiFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: `Request failed: ${res.status}` }));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export function parseError(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Unknown error";
}



