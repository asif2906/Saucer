"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import {
  LayoutDashboard,
  Calendar,
  PenSquare,
  Share2,
  Clock,
  Sparkles,
  BarChart3,
  Building2,
  Users,
  Cpu,
  Settings,
  CreditCard,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: "Overview", href: "/app", icon: LayoutDashboard },
    { name: "Calendar", href: "/app/calendar", icon: Calendar },
    { name: "Create Post", href: "/app/create", icon: PenSquare, highlight: true },
    { name: "Social Accounts", href: "/app/social-accounts", icon: Share2 },
    { name: "Publishing Queue", href: "/app/queue", icon: Clock },
    { name: "Saucer AI", href: "/app/ai", icon: Sparkles, badge: "Free" },
    { name: "Analytics", href: "/app/analytics", icon: BarChart3 },
    { name: "Workspaces", href: "/app/workspaces", icon: Building2 },
    { name: "Team & Roles", href: "/app/team", icon: Users },
    { name: "Automations", href: "/app/automations", icon: Cpu },
  ];

  const secondaryNav = [
    { name: "Billing (Dodo)", href: "/app/settings/billing", icon: CreditCard },
    { name: "Settings", href: "/app/settings", icon: Settings },
  ];

  const sidebarContent = (
    <aside className="w-64 border-r bg-card/60 backdrop-blur-md flex flex-col justify-between h-full select-none">
      {/* Top Brand & Quick Post CTA */}
      <div className="p-4 space-y-4">
        <div className="px-2 py-1">
          <Logo href="/app" size="md" />
        </div>

        <Link
          href="/app/create"
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-xs shadow-md shadow-violet-600/20 hover:opacity-95 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Scheduled Post</span>
        </Link>

        {/* Primary Navigation List */}
        <nav className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Workspace Hub
          </div>
          {navigation.map((item) => {
            const isActive =
              item.href === "/app"
                ? pathname === "/app"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                  isActive
                    ? "bg-violet-600/15 text-violet-600 dark:text-violet-400 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <item.icon
                    className={cn(
                      "w-4 h-4",
                      isActive ? "text-violet-600 dark:text-violet-400" : "text-muted-foreground"
                    )}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-600/10 text-violet-600">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Secondary Links */}
      <div className="p-4 border-t space-y-1">
        <div className="px-3 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          System & Settings
        </div>
        {secondaryNav.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                isActive
                  ? "bg-violet-600/15 text-violet-600 dark:text-violet-400 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <item.icon
                className={cn(
                  "w-4 h-4",
                  isActive ? "text-violet-600 dark:text-violet-400" : "text-muted-foreground"
                )}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}

        {/* Free Tier Status Note */}
        <div className="mt-3 p-2.5 rounded-lg bg-muted/40 border text-[11px] text-muted-foreground">
          <div className="flex items-center justify-between font-semibold text-foreground mb-1">
            <span>Saucer Free Tier</span>
            <span className="text-[10px] text-emerald-500 font-bold">Active</span>
          </div>
          <span>Multi-Channel Publishing</span>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Modal Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
          <div className="relative z-50 flex-1 max-w-[280px] bg-background">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

