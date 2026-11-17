import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export interface AuthenticatedUserContext {
  userId: string;
  email: string;
  profileId: string;
  organizationId: string;
  orgRole: string;
}

export async function getAuthenticatedAiContext(): Promise<
  | { success: true; context: AuthenticatedUserContext }
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
        { error: "Unauthorized. Please sign in to use Saucer AI Studio." },
        { status: 401 }
      ),
    };
  }

  let profileId = "";
  let organizationId = "";
  let orgRole = "OWNER";

  // 1. Try Prisma if DATABASE_URL is configured
  if (process.env.DATABASE_URL) {
    try {
      const profile = await prisma.profile.findUnique({
        where: { supabaseUserId: user.id },
        include: {
          organizationMembers: {
            include: { organization: true },
          },
        },
      });

      if (profile && profile.organizationMembers.length > 0) {
        profileId = profile.id;
        organizationId = profile.organizationMembers[0].organizationId;
        orgRole = profile.organizationMembers[0].role;
      }
    } catch (err) {
      console.warn("[getAuthenticatedAiContext] Prisma lookup failed, falling back to Supabase client:", err);
    }
  }

  // 2. Direct Supabase RLS query fallback
  if (!profileId || !organizationId) {
    try {
      const { data: profileData } = await supabase
        .from("Profile")
        .select("id, OrganizationMember(role, organizationId)")
        .eq("supabaseUserId", user.id)
        .maybeSingle();

      if (profileData) {
        profileId = profileData.id;
        const om = (profileData as any).OrganizationMember?.[0];
        if (om) {
          organizationId = om.organizationId;
          orgRole = om.role || "OWNER";
        }
      }
    } catch (err) {
      console.error("[getAuthenticatedAiContext] Supabase RLS error:", err);
    }
  }

  if (!profileId || !organizationId) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "No organization found for this user account." },
        { status: 403 }
      ),
    };
  }

  return {
    success: true,
    context: {
      userId: user.id,
      email: user.email!,
      profileId,
      organizationId,
      orgRole,
    },
  };
}
