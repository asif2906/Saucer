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
        { error: "Unauthorized. Authentication is required." },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    // Fetch Profile strictly mapped to this verified Supabase user ID
    const { data: profile, error: profileErr } = await supabase
      .from("Profile")
      .select("id, supabaseUserId, email, fullName, avatarUrl, timezone")
      .eq("supabaseUserId", user.id)
      .maybeSingle();

    if (profileErr) {
      console.error("[/api/me] Profile error:", profileErr);
    }

    const effectiveFullName =
      profile?.fullName ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "User";

    // Compute initials
    const nameParts = effectiveFullName.trim().split(/\s+/);
    const initials =
      nameParts.length >= 2
        ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
        : effectiveFullName.slice(0, 2).toUpperCase();

    // Fetch Organization strictly through OrganizationMember referencing profileId
    let organization: any = null;
    let orgRole = "OWNER";
    let workspaces: any[] = [];
    let credits: any = {
      monthlyAllowance: 50,
      monthlyUsed: 0,
      balance: 50,
    };

    if (profile?.id) {
      const { data: orgMembers } = await supabase
        .from("OrganizationMember")
        .select("role, Organization(id, name, slug)")
        .eq("profileId", profile.id);

      if (orgMembers && orgMembers.length > 0) {
        const primaryMember = orgMembers[0] as any;
        organization = primaryMember.Organization;
        orgRole = primaryMember.role || "OWNER";

        if (organization?.id) {
          // Fetch Workspaces strictly belonging to this organization
          const { data: wsData } = await supabase
            .from("Workspace")
            .select("id, name, slug, isDefault, createdAt")
            .eq("organizationId", organization.id)
            .order("createdAt", { ascending: true });

          if (wsData && wsData.length > 0) {
            workspaces = wsData;
          }

          // Fetch AI Credits for this organization
          const { data: crData } = await supabase
            .from("AiCreditBalance")
            .select("monthlyAllowance, monthlyUsed, reservedCredits, purchasedCredits")
            .eq("organizationId", organization.id)
            .maybeSingle();

          if (crData) {
            credits = {
              monthlyAllowance: crData.monthlyAllowance,
              monthlyUsed: crData.monthlyUsed,
              balance: Math.max(0, crData.monthlyAllowance - crData.monthlyUsed),
            };
          }
        }
      }
    }

    // Default workspace fallback if none found
    if (workspaces.length === 0 && organization?.id) {
      workspaces = [
        {
          id: `ws-${organization.id}`,
          name: "Main Workspace",
          slug: "main",
          isDefault: true,
        },
      ];
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: profile?.id || user.id,
          supabaseUserId: user.id,
          email: user.email,
          fullName: effectiveFullName,
          initials,
          avatarUrl: profile?.avatarUrl || null,
          timezone: profile?.timezone || "UTC",
        },
        organization: organization
          ? {
              id: organization.id,
              name: organization.name,
              slug: organization.slug,
              role: orgRole,
            }
          : null,
        workspaces,
        currentWorkspace: workspaces[0] || null,
        credits,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err: any) {
    console.error("[/api/me] Internal Error:", err);
    return NextResponse.json(
      { error: "Internal server error", message: err.message },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    const body = await req.json();
    const { fullName, timezone } = body;

    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };
    if (typeof fullName === "string" && fullName.trim()) {
      updates.fullName = fullName.trim();
    }
    if (typeof timezone === "string" && timezone.trim()) {
      updates.timezone = timezone.trim();
    }

    const { data: updatedProfile, error: updateErr } = await supabase
      .from("Profile")
      .update(updates)
      .eq("supabaseUserId", user.id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json(
        { error: "Failed to update profile", message: updateErr.message },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        profile: updatedProfile,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal error", message: err.message },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}
