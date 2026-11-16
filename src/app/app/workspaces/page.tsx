"use client";

import { useState } from "react";
import { 
  Briefcase, 
  Plus, 
  Check, 
  Settings, 
  Users, 
  Share2, 
  Calendar, 
  Sparkles, 
  Globe, 
  Clock, 
  Palette, 
  Hash, 
  Trash2,
  ExternalLink,
  Info
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
  role: string;
  membersCount: number;
  channelsCount: number;
  postsScheduled: number;
  timezone: string;
  color: string;
  isActive: boolean;
}

const INITIAL_WORKSPACES: WorkspaceItem[] = [
  {
    id: "ws-1",
    name: "Acme Corp Brand",
    slug: "acme-corp",
    role: "Owner",
    membersCount: 4,
    channelsCount: 6,
    postsScheduled: 12,
    timezone: "America/New_York (UTC-5)",
    color: "#10b981", // Emerald
    isActive: true,
  },
  {
    id: "ws-2",
    name: "Saucer Community",
    slug: "saucer-community",
    role: "Admin",
    membersCount: 8,
    channelsCount: 4,
    postsScheduled: 5,
    timezone: "UTC",
    color: "#6366f1", // Indigo
    isActive: false,
  },
  {
    id: "ws-3",
    name: "Personal Tech Blog",
    slug: "personal-tech",
    role: "Owner",
    membersCount: 1,
    channelsCount: 2,
    postsScheduled: 2,
    timezone: "America/Los_Angeles (UTC-8)",
    color: "#f59e0b", // Amber
    isActive: false,
  },
];

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>(INITIAL_WORKSPACES);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newColor, setNewColor] = useState("#10b981");
  const [newTimezone, setNewTimezone] = useState("UTC");
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const activeWorkspace = workspaces.find((w) => w.isActive) || workspaces[0];

  const handleSwitchWorkspace = (id: string) => {
    setWorkspaces((prev) =>
      prev.map((w) => ({
        ...w,
        isActive: w.id === id,
      }))
    );
    const switched = workspaces.find((w) => w.id === id);
    setFeedbackMsg(`Switched active workspace to "${switched?.name}". Session state updated.`);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const generatedSlug = newSlug.trim() || newName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const newWs: WorkspaceItem = {
      id: `ws-${Date.now()}`,
      name: newName.trim(),
      slug: generatedSlug,
      role: "Owner",
      membersCount: 1,
      channelsCount: 0,
      postsScheduled: 0,
      timezone: newTimezone,
      color: newColor,
      isActive: false,
    };

    setWorkspaces((prev) => [...prev, newWs]);
    setNewName("");
    setNewSlug("");
    setIsCreating(false);
    setFeedbackMsg(`Workspace "${newWs.name}" created successfully.`);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workspaces & Brand Kits</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize distinct clients, brands, or projects with isolated channels, schedules, and team permissions.
          </p>
        </div>

        <Button 
          onClick={() => setIsCreating(!isCreating)} 
          className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white"
        >
          <Plus className="h-4 w-4" />
          {isCreating ? "Cancel" : "New Workspace"}
        </Button>
      </div>

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0 text-emerald-600" />
          {feedbackMsg}
        </div>
      )}

      {/* Creation Modal / Form */}
      {isCreating && (
        <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Create New Workspace</CardTitle>
            <CardDescription className="text-xs">
              Every workspace gets its own isolated publishing queue, media library, and analytics.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleCreateWorkspace}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Workspace Name</label>
                  <Input
                    placeholder="e.g. Acme Studio"
                    value={newName}
                    onChange={(e) => {
                      setNewName(e.target.value);
                      if (!newSlug) {
                        setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
                      }
                    }}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">URL Slug</label>
                  <Input
                    placeholder="acme-studio"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Default Timezone</label>
                  <select
                    className="w-full text-xs h-9 px-3 rounded-md border bg-background"
                    value={newTimezone}
                    onChange={(e) => setNewTimezone(e.target.value)}
                  >
                    <option value="UTC">UTC (Universal Coordinated Time)</option>
                    <option value="America/New_York (UTC-5)">Eastern Time (America/New_York)</option>
                    <option value="America/Chicago (UTC-6)">Central Time (America/Chicago)</option>
                    <option value="America/Denver (UTC-7)">Mountain Time (America/Denver)</option>
                    <option value="America/Los_Angeles (UTC-8)">Pacific Time (America/Los_Angeles)</option>
                    <option value="Europe/London (UTC+0)">London (Europe/London)</option>
                    <option value="Europe/Paris (UTC+1)">Paris / Berlin (Europe/Paris)</option>
                    <option value="Asia/Tokyo (UTC+9)">Tokyo (Asia/Tokyo)</option>
                    <option value="Asia/Kolkata (UTC+5:30)">India (Asia/Kolkata)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Brand Theme Accent</label>
                  <div className="flex items-center gap-2">
                    {["#10b981", "#6366f1", "#f59e0b", "#ec4899", "#06b6d4", "#8b5cf6"].map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => setNewColor(hex)}
                        className={`h-7 w-7 rounded-full border-2 transition-transform ${
                          newColor === hex ? "scale-110 border-foreground" : "border-transparent hover:scale-105"
                        }`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t pt-4">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white">
                Create Workspace
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* Workspaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {workspaces.map((ws) => (
          <Card 
            key={ws.id} 
            className={`relative transition-all ${
              ws.isActive 
                ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md" 
                : "hover:border-foreground/20"
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
                    style={{ backgroundColor: ws.color }}
                  >
                    {ws.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      {ws.name}
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5 font-mono">
                      /{ws.slug}
                    </CardDescription>
                  </div>
                </div>

                {ws.isActive ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px]">
                    {ws.role}
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pb-3 text-xs text-muted-foreground">
              <div className="grid grid-cols-3 gap-2 py-2 border-y bg-muted/30 rounded-lg px-2 text-center">
                <div>
                  <div className="text-sm font-bold text-foreground font-mono">{ws.channelsCount}</div>
                  <div className="text-[10px]">Channels</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground font-mono">{ws.membersCount}</div>
                  <div className="text-[10px]">Members</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground font-mono">{ws.postsScheduled}</div>
                  <div className="text-[10px]">Queued</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px]">
                <Clock className="h-3 w-3 shrink-0 text-muted-foreground" />
                <span className="truncate">{ws.timezone}</span>
              </div>
            </CardContent>

            <CardFooter className="pt-2 flex items-center justify-between border-t text-xs">
              {ws.isActive ? (
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" />
                  Currently Selected
                </span>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs h-8"
                  onClick={() => handleSwitchWorkspace(ws.id)}
                >
                  Switch to Workspace
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Active Workspace Brand Kit Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Active Workspace Brand Kit: {activeWorkspace.name}</CardTitle>
              <CardDescription className="text-xs">
                Assets and defaults automatically used by Saucer AI during caption generation and scheduling
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              ID: {activeWorkspace.id}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Brand Colors */}
            <div className="space-y-2">
              <label className="text-xs font-semibold flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                Brand Color Palette
              </label>
              <p className="text-xs text-muted-foreground">Used for media asset canvas backgrounds and banner rendering.</p>
              <div className="flex items-center gap-2 pt-1">
                {[activeWorkspace.color, "#0f172a", "#38bdf8", "#f43f5e"].map((c, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div className="h-8 w-12 rounded border shadow-sm" style={{ backgroundColor: c }} />
                    <span className="text-[10px] font-mono text-muted-foreground">{c}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Default Hashtags */}
            <div className="space-y-2">
              <label className="text-xs font-semibold flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                Default Brand Hashtags
              </label>
              <p className="text-xs text-muted-foreground">Appended by default or suggested during AI generation.</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {["#SaucerAI", "#SocialMediaOps", "#GrowthTech", "#Automation"].map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs font-mono">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Brand Voice / AI Persona */}
          <div className="p-4 rounded-xl border bg-muted/20 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-semibold">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              Brand Tone of Voice
            </div>
            <p className="text-muted-foreground">
              Current Tone: <strong className="text-foreground">Professional, authoritative, yet approachable</strong>. 
              Saucer AI Studio automatically injects this persona into Gemini 3.8 Flash prompts when drafting posts for this workspace.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

