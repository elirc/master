"use client";

import { useEffect, useState } from "react";
import { Nosifer } from "next/font/google";
import { useRouter } from "next/navigation";

const nosifer = Nosifer({
  weight: "400",
  subsets: ["latin"],
});

const COUNTDOWN_SECONDS = 5;

export default function SplashPage() {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    const redirectTimer = window.setTimeout(() => {
      router.replace("/home");
    }, COUNTDOWN_SECONDS * 1000);

    const countdownTimer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => {
      window.clearTimeout(redirectTimer);
      window.clearInterval(countdownTimer);
    };
  }, [router]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 text-red-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(220,38,38,0.35),transparent_45%),radial-gradient(circle_at_20%_80%,rgba(127,29,29,0.45),transparent_35%),radial-gradient(circle_at_80%_75%,rgba(185,28,28,0.3),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.2),rgba(0,0,0,0.8))]" />

      <section className="relative w-full max-w-3xl rounded-2xl border border-red-900/60 bg-black/70 p-8 text-center shadow-[0_0_80px_rgba(127,29,29,0.45)] backdrop-blur-sm">
        <p className={`${nosifer.className} text-3xl tracking-wide text-red-500 md:text-5xl`}>Master Life Plan</p>
        <div className="mt-8 space-y-3 text-lg uppercase tracking-[0.24em] text-red-200/95 md:text-2xl">
          <p>Track Time Daily</p>
          <p>Use Time Wisely</p>
          <p>Right Amount Of Hours</p>
        </div>
        <div className="mx-auto mt-8 h-px w-52 bg-gradient-to-r from-transparent via-red-600 to-transparent" />
        <p className="mt-6 text-sm tracking-[0.18em] text-red-300/90 md:text-base">
          Entering in {secondsLeft}s
        </p>
      </section>
    </main>
  );
}
