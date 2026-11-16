import React from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-background relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header with Logo */}
      <header className="p-6 sm:p-8 flex items-center justify-between z-10">
        <Logo href="/" size="md" />
        <Link
          href="/"
          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to homepage
        </Link>
      </header>

      {/* Main Content Box */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-muted-foreground z-10">
        Protected by Saucer Multi-Tenant Security & Supabase Auth.
      </footer>
    </div>
  );
}

