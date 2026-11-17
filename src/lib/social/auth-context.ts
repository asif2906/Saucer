import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export interface SocialAuthContext {
  userId: string;
  email: string;
  profileId: string;
  organizationId: string;
  workspaceId: string;
  orgRole: string;
}

export async function getSocialAuthContext(): Promise<
  | { success: true; context: SocialAuthContext }
  | { success: false; response: NextResponse }
> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Unauthorized. Authentication is required." },
        { status: 401 }
      ),
    };
  }

  let profileId = "";
  let organizationId = "";
  let workspaceId = "";
  let orgRole = "OWNER";

  // 1. Try Prisma if DATABASE_URL is configured
  if (process.env.DATABASE_URL) {
    try {
      const profile = await prisma.profile.findUnique({
        where: { supabaseUserId: user.id },
        include: {
          organizationMembers: {
            include: {
              organization: {
                include: { workspaces: true },
              },
            },
          },
        },
      });

      if (profile && profile.organizationMembers.length > 0) {
        profileId = profile.id;
        const activeOrgMember = profile.organizationMembers[0];
        organizationId = activeOrgMember.organization.id;
        workspaceId = activeOrgMember.organization.workspaces[0]?.id || "";
        orgRole = activeOrgMember.role;
      }
    } catch (err) {
      console.warn("[getSocialAuthContext] Prisma lookup failed, falling back to Supabase client:", err);
    }
  }

  // 2. Direct Supabase RLS query fallback
  if (!profileId) {
    try {
      const { data: profile, error: pErr } = await supabase
        .from("Profile")
        .select("id, OrganizationMember(role, Organization(id, Workspace(id)))")
        .eq("supabaseUserId", user.id)
        .maybeSingle();

      if (profile) {
        profileId = profile.id;
        const om = (profile as any).OrganizationMember?.[0];
        if (om?.Organization) {
          organizationId = om.Organization.id;
          orgRole = om.role || "OWNER";
          workspaceId = om.Organization.Workspace?.[0]?.id || "";
        }
      }
    } catch (err) {
      console.error("[getSocialAuthContext] Supabase RLS lookup error:", err);
    }
  }

  if (!profileId || !organizationId) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "User is not associated with any active organization." },
        { status: 403 }
      ),
    };
  }

  if (!workspaceId) {
    workspaceId = `ws-${organizationId}`;
  }

  return {
    success: true,
    context: {
      userId: user.id,
      email: user.email!,
      profileId,
      organizationId,
      workspaceId,
      orgRole,
    },
  };
}
