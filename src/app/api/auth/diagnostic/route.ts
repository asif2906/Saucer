import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          authenticated: false,
          error: "Unauthenticated. No valid Supabase session cookie found.",
          sessionValid: false,
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    // Lookup Profile mapped to this specific Supabase user
    const { data: profile, error: profileErr } = await supabase
      .from("Profile")
      .select("id, supabaseUserId, email, fullName, timezone")
      .eq("supabaseUserId", user.id)
      .maybeSingle();

    let organization: any = null;
    let workspaces: any[] = [];

    if (profile?.id) {
      const { data: orgMembers } = await supabase
        .from("OrganizationMember")
        .select("role, Organization(id, name, slug)")
        .eq("profileId", profile.id);

      if (orgMembers && orgMembers.length > 0) {
        organization = (orgMembers[0] as any).Organization;

        if (organization?.id) {
          const { data: wsData } = await supabase
            .from("Workspace")
            .select("id, name, slug, isDefault")
            .eq("organizationId", organization.id)
            .order("createdAt", { ascending: true });

          workspaces = wsData || [];
        }
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://unknown.supabase.co";
    let supabaseHost = "unknown";
    try {
      supabaseHost = new URL(supabaseUrl).host;
    } catch {
      supabaseHost = supabaseUrl;
    }

    return NextResponse.json(
      {
        authenticated: true,
        sessionValid: true,
        supabaseUserId: user.id,
        email: user.email,
        profileId: profile?.id || null,
        profileEmail: profile?.email || null,
        profileFullName: profile?.fullName || null,
        mappingStatus: profile
          ? profile.supabaseUserId === user.id
            ? "PERFECT_MATCH"
            : "MISMATCH"
          : "MISSING_PROFILE",
        organizationId: organization?.id || null,
        organizationName: organization?.name || null,
        organizationSlug: organization?.slug || null,
        workspaceId: workspaces[0]?.id || null,
        workspaceName: workspaces[0]?.name || null,
        workspacesCount: workspaces.length,
        supabaseHost,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        authenticated: false,
        error: "Diagnostic internal error",
        message: err.message,
      },
      { status: 500 }
    );
  }
}
