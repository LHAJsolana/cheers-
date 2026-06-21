import type { Metadata } from "next";
import Link from "next/link";
import { Flame } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cheers",
  description: "Track the night. Remember the vibes.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-24 pt-5 sm:px-6">
          <header className="mb-5 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-black">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-neon text-ink">
                <Flame size={20} />
              </span>
              <span>Cheers</span>
            </Link>
            <Link href="/dashboard" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">
              Open app
            </Link>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
