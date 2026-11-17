import React from "react";
import { AppShellClient } from "./app-shell-client";

// Prevent static HTML generation or CDN edge-caching across user sessions
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShellClient>{children}</AppShellClient>;
}
