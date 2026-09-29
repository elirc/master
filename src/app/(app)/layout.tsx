import { AppShell } from "@/components/app-shell";
import { requireUserOrRedirect } from "@/lib/auth";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUserOrRedirect();

  return <AppShell user={{ id: user.id, username: user.username }}>{children}</AppShell>;
}



