"use client";

import React, { useState, useEffect, Suspense } from "react";
import { PlatformIcon } from "@/components/platform-icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { 
  Plus, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ExternalLink,
  Loader2,
  Clock,
  Sparkles,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

interface SocialAccountItem {
  id: string;
  provider: string;
  accountName: string;
  accountHandle?: string | null;
  accountType: string;
  avatarUrl?: string | null;
  connectionStatus: string;
  tokenExpiresAt?: string | null;
  lastRefreshedAt?: string | null;
  isTokenExpired: boolean;
  capabilities: {
    supportsText: boolean;
    supportsImages: boolean;
    supportsVideo: boolean;
    supportsCarousels: boolean;
    supportsReelsOrShorts: boolean;
    maxTextLength: number;
    maxImages: number;
    requiresMediaForPost: boolean;
  };
}

const AVAILABLE_NETWORKS = [
  {
    id: "instagram",
    name: "Instagram Business/Creator",
    badge: "Phase B Verified",
    desc: "Official Instagram Graph API • Single image, carousels (10) and Reels video publishing.",
    active: true,
  },
  {
    id: "facebook",
    name: "Facebook Pages",
    badge: "Phase C Verified",
    desc: "Meta Graph API • Page authorization, page tokens, text posts, photos and video reels.",
    active: true,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    badge: "Phase D Verified",
    desc: "LinkedIn REST Posts API • Member updates and Organization pages (Community Management API).",
    active: true,
  },
  {
    id: "youtube",
    name: "YouTube",
    badge: "Phase E Verified",
    desc: "Google OAuth 2.0 • Video uploads and YouTube Shorts (subject to daily Google API quota).",
    active: true,
  },
  {
    id: "pinterest",
    name: "Pinterest",
    badge: "Phase E Verified",
    desc: "Pinterest API v5 • Visual Pins, board targeting and rich media links.",
    active: true,
  },
  {
    id: "x",
    name: "X (Twitter)",
    badge: "Postponed",
    desc: "X API v2 access postponed pending official API pricing and budget approval.",
    active: false,
  },
];

function SocialAccountsContent() {
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<SocialAccountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingNetwork, setConnectingNetwork] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/social/accounts");
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
      }
    } catch (err) {
      console.error("Failed to load accounts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();

    // Check URL parameters for OAuth completion/error feedback
    const connected = searchParams.get("connected");
    const provider = searchParams.get("provider");
    const error = searchParams.get("error");

    if (connected && provider) {
      toast.success(`Successfully connected ${provider.toUpperCase()} account to workspace!`);
    } else if (error) {
      toast.error(`OAuth error: ${decodeURIComponent(error)}`);
    }
  }, [searchParams]);

  const handleConnect = async (networkId: string) => {
    if (networkId === "x") {
      toast.info("X API integration is postponed pending platform API pricing evaluation.");
      return;
    }

    setConnectingNetwork(networkId);
    try {
      const res = await fetch(`/api/social/oauth/${networkId}/authorize`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || `Failed to initiate ${networkId} OAuth.`);
      } else if (data.authUrl) {
        toast.info(`Redirecting to ${networkId.toUpperCase()} official authorization portal...`);
        window.location.href = data.authUrl;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to contact authorization service.");
    } finally {
      setConnectingNetwork(null);
    }
  };

  const handleDisconnect = async (id: string, name: string) => {
    setActionLoading(`disconnect-${id}`);
    try {
      const res = await fetch(`/api/social/accounts/${id}/disconnect`, {
        method: "POST",
      });

      if (res.ok) {
        toast.success(`Disconnected ${name} from workspace.`);
        setAccounts(accounts.filter((a) => a.id !== id));
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to disconnect account.");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error while disconnecting.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefresh = async (id: string, name: string) => {
    setActionLoading(`refresh-${id}`);
    try {
      const res = await fetch(`/api/social/accounts/${id}/refresh`, {
        method: "POST",
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Refreshed OAuth security tokens for ${name}.`);
        fetchAccounts();
      } else {
        toast.error(data.error || "Token refresh failed.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to refresh token.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Connected Social Accounts
            </h1>
            <Badge variant="outline" className="text-xs border-primary/30 text-primary font-mono">
              Priority 4 OAuth Engine
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage official OAuth 2.0 connections, verify token expiration health, and publish across platforms.
          </p>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchAccounts} 
          disabled={loading}
          className="text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Status
        </Button>
      </div>

      {/* Connected Accounts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Active Workspace Channels ({accounts.length} Connected)
          </h2>
          <Badge variant="outline" className="text-xs">
            AES-256-GCM Encrypted at Rest
          </Badge>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground border rounded-xl bg-card">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
            Loading connected channels...
          </div>
        ) : accounts.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <div className="max-w-md mx-auto space-y-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Plus className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base">No Social Accounts Connected Yet</h3>
              <p className="text-xs text-muted-foreground">
                Connect your professional Instagram, Facebook Page, LinkedIn, YouTube, or Pinterest account below to start scheduling and publishing content.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((acc) => {
              const isWarning = acc.isTokenExpired || acc.connectionStatus === "ERROR" || acc.connectionStatus === "EXPIRED";

              return (
                <Card key={acc.id} className={`p-4 flex flex-col justify-between ${isWarning ? "border-amber-500/50 bg-amber-500/5" : ""}`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg bg-muted border">
                        <PlatformIcon platform={acc.provider.toLowerCase()} size={22} />
                      </div>
                      <Badge 
                        variant={isWarning ? "destructive" : "outline"} 
                        className={`gap-1 text-[11px] ${!isWarning ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10" : ""}`}
                      >
                        {isWarning ? (
                          <>
                            <AlertTriangle className="w-3 h-3" />
                            {acc.isTokenExpired ? "Token Expired" : acc.connectionStatus}
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            Connected & Active
                          </>
                        )}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-foreground">{acc.accountName}</h3>
                      <p className="text-xs text-muted-foreground">
                        {acc.accountHandle || `${acc.provider.toLowerCase()} • ${acc.accountType}`}
                      </p>
                    </div>

                    {/* Capability Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {acc.capabilities.supportsText && <Badge variant="secondary" className="text-[10px]">Text</Badge>}
                      {acc.capabilities.supportsImages && <Badge variant="secondary" className="text-[10px]">Images</Badge>}
                      {acc.capabilities.supportsVideo && <Badge variant="secondary" className="text-[10px]">Video</Badge>}
                      {acc.capabilities.supportsCarousels && <Badge variant="secondary" className="text-[10px]">Carousel (10)</Badge>}
                      {acc.capabilities.supportsReelsOrShorts && <Badge variant="secondary" className="text-[10px]">Shorts/Reels</Badge>}
                    </div>

                    {isWarning && (
                      <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>Security token expired. Please refresh or reconnect.</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t mt-4 flex items-center justify-between gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRefresh(acc.id, acc.accountName)}
                      disabled={actionLoading === `refresh-${acc.id}`}
                      className="text-xs h-8 text-muted-foreground hover:text-foreground"
                    >
                      <RefreshCw className={`h-3 w-3 mr-1 ${actionLoading === `refresh-${acc.id}` ? "animate-spin" : ""}`} />
                      Refresh Token
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDisconnect(acc.id, acc.accountName)}
                      disabled={actionLoading === `disconnect-${acc.id}`}
                      className="text-xs h-8 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Disconnect
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Available Platforms to Connect */}
      <div className="space-y-4 pt-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Available Supported Networks
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Connect verified social accounts to publish posts, schedule threads, and sync engagement analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {AVAILABLE_NETWORKS.map((net) => (
            <Card key={net.id} className={`p-4 flex flex-col justify-between ${!net.active ? "opacity-60 bg-muted/40" : ""}`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-muted border">
                    <PlatformIcon platform={net.id} size={24} />
                  </div>
                  <Badge variant={net.active ? "outline" : "secondary"} className="text-[10px]">
                    {net.badge}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-bold text-sm">{net.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {net.desc}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-2">
                <Button
                  className="w-full text-xs font-semibold gap-1.5"
                  variant={net.active ? "default" : "secondary"}
                  disabled={!net.active || connectingNetwork === net.id}
                  onClick={() => handleConnect(net.id)}
                >
                  {connectingNetwork === net.id ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Connecting...
                    </>
                  ) : !net.active ? (
                    "Evaluation In Progress"
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      Connect {net.name.split(" ")[0]}
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SocialAccountsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
          Loading social accounts...
        </div>
      }
    >
      <SocialAccountsContent />
    </Suspense>
  );
}
