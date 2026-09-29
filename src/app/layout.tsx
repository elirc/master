import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { PwaRegister } from "@/components/pwa-register";

export const metadata: Metadata = {
  title: "Master Life Plan",
  description: "Personal life planning with daily checklist and schedule tracking.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <PwaRegister />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}



