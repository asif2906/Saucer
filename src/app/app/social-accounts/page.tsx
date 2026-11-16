"use client";

import React, { useState } from "react";
import { PlatformIcon } from "@/components/platform-icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Plus, RefreshCw, Trash2, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function SocialAccountsPage() {
  const [accounts, setAccounts] = useState([
    {
      id: "acc_1",
      platform: "x",
      name: "Acme Tech Orbit",
      handle: "@acmeorbit",
      connectedAt: "Nov 10, 2026",
      status: "Healthy",
    },
    {
      id: "acc_2",
      platform: "linkedin",
      name: "Acme Media Group",
      handle: "acme-media",
      connectedAt: "Nov 12, 2026",
      status: "Healthy",
    },
    {
      id: "acc_3",
      platform: "instagram",
      name: "Acme Visuals",
      handle: "@acmevisuals",
      connectedAt: "Nov 15, 2026",
      status: "Healthy",
    },
  ]);

  const availableNetworks = [
    { id: "x", name: "X (Twitter)", desc: "OAuth 2.0 PKCE • Posts & Threads" },
    { id: "linkedin", name: "LinkedIn Profile", desc: "Professional network updates" },
    { id: "linkedin-page", name: "LinkedIn Company Page", desc: "Corporate page broadcasts" },
    { id: "instagram", name: "Instagram Business", desc: "Photo, carousel and Reels" },
    { id: "facebook", name: "Facebook Pages", desc: "Page posts and video reels" },
    { id: "threads", name: "Threads", desc: "Official Meta Threads publishing" },
    { id: "youtube", name: "YouTube", desc: "Long-form videos and Shorts" },
    { id: "tiktok", name: "TikTok", desc: "Vertical video content posting" },
    { id: "pinterest", name: "Pinterest", desc: "Visual pins and board publishing" },
    { id: "reddit", name: "Reddit", desc: "Subreddit posts and community flairs" },
    { id: "bluesky", name: "Bluesky", desc: "AT Protocol decentralized feed" },
  ];

  const handleConnect = (network: string) => {
    toast.info(
      `Initiating secure OAuth handshake for ${network.toUpperCase()}. (Requires platform API credentials in production).`
    );
  };

  const handleDisconnect = (id: string, name: string) => {
    setAccounts(accounts.filter((a) => a.id !== id));
    toast.success(`Disconnected ${name} from workspace.`);
  };

  const handleRefresh = (name: string) => {
    toast.success(`Refreshed OAuth security tokens for ${name}.`);
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Connected Social Accounts
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Manage OAuth connections, verify token health, and connect new platforms.
        </p>
      </div>

      {/* Connected Accounts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Active Workspace Channels ({accounts.length} / 3 Free Plan Limit)
          </h2>
          <Badge variant="purple" className="text-xs">
            Free Plan Entitlement
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {accounts.map((acc) => (
            <Card key={acc.id} className="p-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-muted border">
                    <PlatformIcon platform={acc.platform} size={22} />
                  </div>
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{acc.status}</span>
                  </Badge>
                </div>

                <div>
                  <h3 className="font-bold text-foreground text-sm">{acc.name}</h3>
                  <p className="text-xs text-muted-foreground">{acc.handle}</p>
                </div>

                <div className="text-[11px] text-muted-foreground pt-2 border-t">
                  Connected on {acc.connectedAt}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRefresh(acc.name)}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  <span>Refresh Token</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDisconnect(acc.id, acc.name)}
                  className="h-7 text-xs text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  <span>Disconnect</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Connect New Channels Catalog */}
      <div className="space-y-4 pt-4 border-t">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Available Platform Integrations
          </h2>
          <p className="text-xs text-muted-foreground">
            Connect your brand accounts using official platform OAuth 2.0 protocols.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {availableNetworks.map((net) => (
            <div
              key={net.id}
              className="p-3.5 rounded-xl border bg-card/60 hover:border-violet-500/40 hover:bg-accent/30 transition-all flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-muted shrink-0">
                  <PlatformIcon platform={net.id} size={18} />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-foreground">{net.name}</h4>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{net.desc}</p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConnect(net.name)}
                className="w-full mt-3 h-7 text-xs gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Connect</span>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

