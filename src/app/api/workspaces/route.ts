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

    // Get user's profile and organization
    const { data: profile } = await supabase
      .from("Profile")
      .select("id, OrganizationMember(role, Organization(id, name, slug))")
      .eq("supabaseUserId", user.id)
      .maybeSingle();

    const orgMember = (profile as any)?.OrganizationMember?.[0];
    const orgId = orgMember?.Organization?.id;

    if (!orgId) {
      return NextResponse.json({ success: true, workspaces: [] });
    }

    const { data: workspaces, error: wsError } = await supabase
      .from("Workspace")
      .select("id, name, slug, isDefault, createdAt, updatedAt")
      .eq("organizationId", orgId)
      .order("createdAt", { ascending: true });

    if (wsError) {
      return NextResponse.json({ error: wsError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      workspaces: workspaces || [],
      organization: orgMember?.Organization,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("Profile")
      .select("id, OrganizationMember(role, organizationId)")
      .eq("supabaseUserId", user.id)
      .maybeSingle();

    const orgMember = (profile as any)?.OrganizationMember?.[0];
    const orgId = orgMember?.organizationId;

    if (!orgId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Workspace name is required" }, { status: 400 });
    }

    const trimmedName = name.trim();
    const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");

    const { data: newWorkspace, error: createError } = await supabase
      .from("Workspace")
      .insert({
        organizationId: orgId,
        name: trimmedName,
        slug: `${slug}-${Date.now().toString(36)}`,
        isDefault: false,
      })
      .select()
      .single();

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      workspace: newWorkspace,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
