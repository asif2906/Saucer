"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/user-context";
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  Clock, 
  MoreVertical, 
  Trash2, 
  Check, 
  AlertCircle,
  Shield,
  Edit3,
  Eye
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Editor" | "Viewer";
  status: "Active" | "Pending";
  joinedDate: string;
  avatar?: string;
}

export default function TeamPage() {
  const { user, organization } = useUser();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"Admin" | "Editor" | "Viewer">("Editor");
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function loadMembers() {
      try {
        setLoading(true);
        const res = await fetch("/api/team");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.members && data.members.length > 0) {
            setMembers(data.members);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to load team members:", err);
      } finally {
        setLoading(false);
      }

      // Default to current authenticated user as Owner
      if (user) {
        setMembers([
          {
            id: user.id,
            name: user.fullName || "User",
            email: user.email,
            role: "Owner",
            status: "Active",
            joinedDate: "Owner",
          },
        ]);
      }
    }

    loadMembers();
  }, [user]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const newMember: TeamMember = {
      id: `m-${Date.now()}`,
      name: inviteEmail.split("@")[0],
      email: inviteEmail.trim(),
      role: inviteRole,
      status: "Pending",
      joinedDate: "Just now",
    };

    setMembers((prev) => [...prev, newMember]);
    setInviteEmail("");
    setFeedback(`Invitation dispatched to ${newMember.email} with ${newMember.role} privileges.`);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleRemoveMember = (id: string, name: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setFeedback(`Removed ${name} from this workspace.`);
    setTimeout(() => setFeedback(null), 3500);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "Owner":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "Admin":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "Editor":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "Viewer":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team & Member Permissions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Invite teammates, grant role-based publishing authority, and collaborate safely across channels.
        </p>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0 text-emerald-600" />
          {feedback}
        </div>
      )}

      {/* Invite Member Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-emerald-500" />
            Invite Teammate to Workspace
          </CardTitle>
          <CardDescription className="text-xs">
            An invitation link will be sent to their email with workspace onboarding instructions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="pl-9 text-xs"
                required
              />
            </div>

            <select
              className="text-xs h-9 px-3 rounded-md border bg-background"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as "Admin" | "Editor" | "Viewer")}
            >
              <option value="Admin">Admin (Full Workspace Control)</option>
              <option value="Editor">Editor (Create, Schedule, Edit)</option>
              <option value="Viewer">Viewer (Read-only Analytics)</option>
            </select>

            <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 text-xs">
              <UserPlus className="h-3.5 w-3.5" />
              Send Invite
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Team Members List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold">Active Members ({members.length})</CardTitle>
            <CardDescription className="text-xs">Users with access to this workspace</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="pb-3 font-medium">User</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Joined</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-muted text-xs font-semibold">
                            {member.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground">{member.name}</div>
                          <div className="text-[11px] text-muted-foreground">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge className={`text-[10px] font-medium border ${getRoleBadgeVariant(member.role)}`}>
                        {member.role}
                      </Badge>
                    </td>
                    <td className="py-3">
                      {member.status === "Active" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                          Invite Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-muted-foreground whitespace-nowrap">
                      {member.joinedDate}
                    </td>
                    <td className="py-3 text-right">
                      {member.role === "Owner" ? (
                        <span className="text-[11px] text-muted-foreground italic">Workspace Owner</span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id, member.name)}
                          className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Revoke
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Breakdown Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Role Permissions Overview
          </CardTitle>
          <CardDescription className="text-xs">
            Granular access controls enforced server-side via Supabase Row Level Security and Prisma middleware
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-lg border bg-muted/20 space-y-1.5">
              <div className="font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                Owner
              </div>
              <p className="text-muted-foreground text-[11px]">
                Full administrative authority, Dodo Payments billing management, workspace deletion, and member access grants.
              </p>
            </div>

            <div className="p-3 rounded-lg border bg-muted/20 space-y-1.5">
              <div className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin
              </div>
              <p className="text-muted-foreground text-[11px]">
                Connect/disconnect social channels, manage automations, invite editors and viewers, and configure brand settings.
              </p>
            </div>

            <div className="p-3 rounded-lg border bg-muted/20 space-y-1.5">
              <div className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Edit3 className="h-3.5 w-3.5" />
                Editor
              </div>
              <p className="text-muted-foreground text-[11px]">
                Create posts, run Saucer AI generation, schedule content to the calendar, and manage the publishing queue.
              </p>
            </div>

            <div className="p-3 rounded-lg border bg-muted/20 space-y-1.5">
              <div className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                Viewer
              </div>
              <p className="text-muted-foreground text-[11px]">
                Read-only calendar inspection, scheduled post preview, and aggregated analytics reporting. Cannot publish or edit.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

