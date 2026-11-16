import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export interface BillingAuthContext {
  userId: string;
  email: string;
  fullName?: string;
  profileId: string;
  organizationId: string;
  orgRole: string;
}

export async function getBillingAuthContext(): Promise<
  | { success: true; context: BillingAuthContext }
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
      const activeMember = org.members[0];
      return {
        success: true,
        context: {
          userId: user.id,
          email: user.email!,
          fullName: activeMember.profile.fullName || undefined,
          profileId: activeMember.profileId,
          organizationId: org.id,
          orgRole: activeMember.role,
        },
      };
    }

    return {
      success: false,
      response: NextResponse.json(
        { error: "User is not associated with any organization." },
        { status: 403 }
      ),
    };
  }

  const activeMembership = profile.organizationMembers[0];

  return {
    success: true,
    context: {
      userId: user.id,
      email: user.email!,
      fullName: profile.fullName || undefined,
      profileId: profile.id,
      organizationId: activeMembership.organizationId,
      orgRole: activeMembership.role,
    },
  };
}
