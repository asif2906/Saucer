"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Bell,
  Sparkles,
  User,
  Settings,
  CreditCard,
  LogOut,
  Moon,
  Sun,
  Menu,
} from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { toast } from "sonner";

interface AppHeaderProps {
  onToggleSidebar?: () => void;
}

export function AppHeader({ onToggleSidebar }: AppHeaderProps) {
  const router = useRouter();
  const { user, credits, signOut } = useUser();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out of Saucer");
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b bg-background/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <WorkspaceSwitcher />
      </div>

      {/* Global Search Bar */}
      <div className="hidden sm:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search posts, drafts, analytics, channels... (Cmd+K)"
            className="w-full h-8 pl-9 pr-3 rounded-lg border bg-muted/40 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Saucer AI Credit Badge (Free Tier Quota Status) */}
        <Link
          href="/app/ai"
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-violet-600/5 hover:bg-violet-600/10 border-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-semibold transition-colors"
          title={`Saucer AI Quota: ${credits?.balance ?? 50}/${credits?.monthlyAllowance ?? 50} Available`}
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-500" />
          <span>{credits?.balance ?? 50} AI Credits</span>
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          title="Toggle Light / Dark mode"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Popover Trigger */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-600" />
          </button>

          {notificationsOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
              <div className="absolute right-0 mt-2 w-72 rounded-xl border bg-card shadow-2xl z-50 p-3 space-y-2 text-xs">
                <div className="font-semibold text-foreground pb-2 border-b flex justify-between items-center">
                  <span>Notifications</span>
                  <Badge variant="purple" className="text-[10px] py-0 px-1.5">1 New</Badge>
                </div>
                <div className="p-2 rounded-lg bg-muted/30">
                  <span className="font-semibold text-foreground block">Welcome to Saucer!</span>
                  <span className="text-muted-foreground text-[11px] block mt-0.5">
                    Connect your first social channel to begin visual scheduling.
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-violet-500/20 transition-all"
          >
            <Avatar className="w-8 h-8 border border-border">
              <AvatarImage src={user?.avatarUrl || ""} />
              <AvatarFallback className="bg-violet-600 text-white font-bold text-xs">
                {user?.initials || "U"}
              </AvatarFallback>
            </Avatar>
          </button>

          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-card shadow-2xl z-50 p-1.5 space-y-1 text-xs">
                <div className="px-3 py-2 border-b">
                  <div className="font-semibold text-foreground truncate">
                    {user?.fullName || "Saucer User"}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {user?.email || ""}
                  </div>
                </div>

                <Link
                  href="/app/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-muted text-foreground transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Profile Settings</span>
                </Link>

                <Link
                  href="/app/settings/billing"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-muted text-foreground transition-colors"
                >
                  <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Billing & Plans (Dodo)</span>
                </Link>

                <div className="pt-1 mt-1 border-t">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-destructive/10 text-destructive text-left transition-colors font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

