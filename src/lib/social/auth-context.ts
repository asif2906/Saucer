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
      workspaceMembers: {
        include: { workspace: true },
      },
    },
  });

  if (!profile || profile.organizationMembers.length === 0) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "User is not associated with any active organization." },
        { status: 403 }
      ),
    };
  }

  const activeOrgMember = profile.organizationMembers[0];
  const org = activeOrgMember.organization;

  // Find default or first workspace
  let workspaceId = org.workspaces[0]?.id;
  if (!workspaceId) {
    // Auto-create default workspace if none exists
    const defaultWorkspace = await prisma.workspace.create({
      data: {
        organizationId: org.id,
        name: "Primary Workspace",
        slug: "primary",
        isDefault: true,
      },
    });
    workspaceId = defaultWorkspace.id;
  }

  return {
    success: true,
    context: {
      userId: user.id,
      email: user.email!,
      profileId: profile.id,
      organizationId: org.id,
      workspaceId,
      orgRole: activeOrgMember.role,
    },
  };
}
