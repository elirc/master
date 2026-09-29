"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useOfflineSync } from "@/hooks/use-offline-sync";
import { OfflineBanner } from "@/components/ui/offline-banner";

const navItems = [
  { href: "/today", label: "Today", icon: "T" },
  { href: "/plan", label: "Plan", icon: "P" },
  { href: "/goals", label: "Goals", icon: "G" },
  { href: "/review", label: "Review", icon: "R" },
  { href: "/settings", label: "Settings", icon: "S" },
];

export function AppShell({
  user,
  children,
}: {
  user: { id: string; username: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const offline = useOfflineSync(user.id);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <OfflineBanner isOffline={offline.isOffline} pending={offline.pending} syncing={offline.syncing} onSync={offline.runSync} />

      <div className="mx-auto flex w-full max-w-7xl gap-4 px-3 pb-20 pt-4 md:px-6 md:pb-4">
        <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-56 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-3 md:flex">
          <div>
            <h1 className="mb-5 text-lg font-semibold">Master Life Plan</h1>
            <nav className="space-y-1" aria-label="Sidebar">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                    pathname === item.href ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100",
                  )}
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded border border-current text-[10px]">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
          <form action="/api/auth/logout" method="post">
            <p className="mb-2 text-xs text-slate-500">Signed in as {user.username}</p>
            <button className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" type="submit">
              Log out
            </button>
          </form>
        </aside>

        <main className="w-full flex-1">{children}</main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white md:hidden" aria-label="Bottom navigation">
        <ul className="grid grid-cols-5">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-1 py-2 text-xs",
                  pathname === item.href ? "text-slate-900" : "text-slate-500",
                )}
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded border border-current text-[10px]">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}



