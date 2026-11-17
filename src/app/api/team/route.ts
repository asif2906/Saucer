import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user's organization
    const { data: profile } = await supabase
      .from("Profile")
      .select("id, OrganizationMember(role, organizationId, Organization(id, name))")
      .eq("supabaseUserId", user.id)
      .maybeSingle();

    const orgMember = (profile as any)?.OrganizationMember?.[0];
    const orgId = orgMember?.organizationId;

    if (!orgId) {
      return NextResponse.json({ success: true, members: [] });
    }

    const { data: members, error: memError } = await supabase
      .from("OrganizationMember")
      .select("id, role, createdAt, Profile(id, email, fullName, avatarUrl)")
      .eq("organizationId", orgId)
      .order("createdAt", { ascending: true });

    if (memError) {
      return NextResponse.json({ error: memError.message }, { status: 500 });
    }

    const formatted = (members || []).map((m: any) => ({
      id: m.id,
      name: m.Profile?.fullName || m.Profile?.email?.split("@")[0] || "User",
      email: m.Profile?.email || "Unknown",
      role: m.role || "MEMBER",
      status: "Active",
      avatarUrl: m.Profile?.avatarUrl,
      joinedDate: new Date(m.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    }));

    return NextResponse.json({
      success: true,
      members: formatted,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
