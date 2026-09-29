"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { parseError } from "@/lib/api-client";

export function LoginForm({ hasUsers }: { hasUsers: boolean }) {
  const [mode, setMode] = useState<"login" | "signup">(hasUsers ? "login" : "signup");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Authentication failed" }));
        throw new Error(body.error ?? "Authentication failed");
      }

      router.push("/today");
      router.refresh();
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <label className="block text-sm">
        <span className="mb-1 block text-slate-700">Username</span>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
          required
          minLength={3}
          maxLength={40}
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-slate-700">Password</span>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
          type="password"
          required
          minLength={8}
          maxLength={128}
        />
      </label>

      {error && <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
      >
        {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
      </button>

      {hasUsers && (
        <button
          type="button"
          onClick={() => setMode((current) => (current === "login" ? "signup" : "login"))}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {mode === "login" ? "Need a new account? Sign up" : "Have an account? Login"}
        </button>
      )}
    </form>
  );
}



