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

  // Look up Profile
  let profile = await prisma.profile.findUnique({
    where: { supabaseUserId: user.id },
    include: {
      organizationMembers: {
        include: { organization: true },
      },
    },
  });

  if (!profile || profile.organizationMembers.length === 0) {
    // If not found (e.g. edge case during signup transition), query directly by email
    const org = await prisma.organization.findFirst({
      where: {
        members: {
          some: {
            profile: { email: user.email! },
          },
        },
      },
      include: {
        members: {
          include: { profile: true },
        },
      },
    });

    if (org && org.members.length > 0) {
      const mem = org.members[0];
      return {
        success: true,
        context: {
          userId: user.id,
          email: user.email!,
          profileId: mem.profileId,
          organizationId: org.id,
          orgRole: mem.role,
        },
      };
    }

    return {
      success: false,
      response: NextResponse.json(
        { error: "No organization found for this user account." },
        { status: 403 }
      ),
    };
  }

  const primaryMembership = profile.organizationMembers[0];
  return {
    success: true,
    context: {
      userId: user.id,
      email: user.email!,
      profileId: profile.id,
      organizationId: primaryMembership.organizationId,
      orgRole: primaryMembership.role,
    },
  };
}
