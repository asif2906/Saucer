"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export interface UserProfile {
  id: string;
  supabaseUserId: string;
  email: string;
  fullName: string;
  initials: string;
  avatarUrl?: string | null;
  timezone: string;
}

export interface OrganizationInfo {
  id: string;
  name: string;
  slug: string;
  role: string;
}

export interface WorkspaceInfo {
  id: string;
  name: string;
  slug: string;
  isDefault?: boolean;
  role?: string;
}

export interface UserCredits {
  balance: number;
  monthlyAllowance: number;
  monthlyUsed: number;
}

interface UserContextValue {
  user: UserProfile | null;
  organization: OrganizationInfo | null;
  workspaces: WorkspaceInfo[];
  currentWorkspace: WorkspaceInfo | null;
  credits: UserCredits | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  switchWorkspace: (workspaceId: string) => void;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<OrganizationInfo | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceInfo | null>(null);
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/me");
      if (res.status === 401) {
        // Not logged in
        setUser(null);
        setOrganization(null);
        setWorkspaces([]);
        setCurrentWorkspace(null);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to load profile (${res.status})`);
      }

      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setOrganization(data.organization);
        setWorkspaces(data.workspaces || []);
        setCredits(data.credits || null);

        // Restore chosen workspace or select first
        const savedWsId = typeof window !== "undefined" ? localStorage.getItem("saucer_active_workspace_id") : null;
        const matchingWs = (data.workspaces || []).find((w: WorkspaceInfo) => w.id === savedWsId);
        setCurrentWorkspace(matchingWs || data.currentWorkspace || data.workspaces?.[0] || null);
      }
    } catch (err: any) {
      console.error("[UserContext] Error fetching user:", err);
      setError(err.message || "Failed to load user session");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const switchWorkspace = useCallback((workspaceId: string) => {
    const target = workspaces.find((w) => w.id === workspaceId);
    if (target) {
      setCurrentWorkspace(target);
      if (typeof window !== "undefined") {
        localStorage.setItem("saucer_active_workspace_id", workspaceId);
      }
    }
  }, [workspaces]);

  const signOut = useCallback(async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Supabase signOut error:", err);
    } finally {
      setUser(null);
      setOrganization(null);
      setWorkspaces([]);
      setCurrentWorkspace(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("saucer_active_workspace_id");
      }
      router.push("/login");
      router.refresh();
    }
  }, [router]);

  return (
    <UserContext.Provider
      value={{
        user,
        organization,
        workspaces,
        currentWorkspace,
        credits,
        loading,
        error,
        refreshUser: fetchUserData,
        switchWorkspace,
        signOut,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
