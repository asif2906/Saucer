-- Saucer Phase 1 & 2 Supabase PostgreSQL Migration
-- Multi-tenant isolation: Profile, Organization, OrganizationMember, Workspace, WorkspaceMember
-- Includes Row Level Security (RLS) policies and automated new user trigger

-- Create Enums
CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');
CREATE TYPE "WorkspaceRole" AS ENUM ('ADMIN', 'EDITOR', 'VIEWER');

-- Create Profile Table
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "supabaseUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT,
    "avatarUrl" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- Create Organization Table
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- Create OrganizationMember Table
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- Create Workspace Table
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- Create WorkspaceMember Table
CREATE TABLE "WorkspaceMember" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "role" "WorkspaceRole" NOT NULL DEFAULT 'EDITOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceMember_pkey" PRIMARY KEY ("id")
);

-- Unique constraints & indexes
CREATE UNIQUE INDEX "Profile_supabaseUserId_key" ON "Profile"("supabaseUserId");
CREATE UNIQUE INDEX "Profile_email_key" ON "Profile"("email");
CREATE INDEX "Profile_supabaseUserId_idx" ON "Profile"("supabaseUserId");
CREATE INDEX "Profile_email_idx" ON "Profile"("email");

CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");
CREATE INDEX "Organization_slug_idx" ON "Organization"("slug");

CREATE UNIQUE INDEX "OrganizationMember_organizationId_profileId_key" ON "OrganizationMember"("organizationId", "profileId");
CREATE INDEX "OrganizationMember_organizationId_idx" ON "OrganizationMember"("organizationId");
CREATE INDEX "OrganizationMember_profileId_idx" ON "OrganizationMember"("profileId");

CREATE UNIQUE INDEX "Workspace_organizationId_slug_key" ON "Workspace"("organizationId", "slug");
CREATE INDEX "Workspace_organizationId_idx" ON "Workspace"("organizationId");

CREATE UNIQUE INDEX "WorkspaceMember_workspaceId_profileId_key" ON "WorkspaceMember"("workspaceId", "profileId");
CREATE INDEX "WorkspaceMember_workspaceId_idx" ON "WorkspaceMember"("workspaceId");
CREATE INDEX "WorkspaceMember_profileId_idx" ON "WorkspaceMember"("profileId");

-- Foreign Keys
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Security Definer RLS Helper Functions (Prevent recursion)
CREATE OR REPLACE FUNCTION public.get_current_profile_id()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT id FROM public."Profile" WHERE "supabaseUserId" = (SELECT auth.uid()::text) LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_org_member(org_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public."OrganizationMember" om
    JOIN public."Profile" p ON om."profileId" = p."id"
    WHERE om."organizationId" = org_id
    AND p."supabaseUserId" = (SELECT auth.uid()::text)
  );
$$;

CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public."WorkspaceMember" wm
    JOIN public."Profile" p ON wm."profileId" = p."id"
    WHERE wm."workspaceId" = ws_id
    AND p."supabaseUserId" = (SELECT auth.uid()::text)
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_current_profile_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_org_member(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_workspace_member(TEXT) TO authenticated, service_role;

-- Row Level Security (RLS) Enablement
ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Organization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrganizationMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Workspace" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkspaceMember" ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view and edit their own profile
CREATE POLICY "Users can view own profile" ON "Profile"
    FOR SELECT USING ("supabaseUserId" = (SELECT auth.uid()::text));

CREATE POLICY "Users can update own profile" ON "Profile"
    FOR UPDATE USING ("supabaseUserId" = (SELECT auth.uid()::text));

-- Organizations: Members can view their organizations
CREATE POLICY "Members can view organization" ON "Organization"
    FOR SELECT USING (public.is_org_member("id"));

CREATE POLICY "Authenticated users can create organization" ON "Organization"
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update organization" ON "Organization"
    FOR UPDATE USING (public.is_org_member("id"));

-- Workspaces: Members can view their workspaces
CREATE POLICY "Members can view workspace" ON "Workspace"
    FOR SELECT USING (public.is_workspace_member("id") OR public.is_org_member("organizationId"));

CREATE POLICY "Org Admins can create workspace" ON "Workspace"
    FOR INSERT WITH CHECK (public.is_org_member("organizationId"));

CREATE POLICY "Admins can update workspace" ON "Workspace"
    FOR UPDATE USING (public.is_workspace_member("id") OR public.is_org_member("organizationId"));

-- Organization Members: Members can view members of their organization
CREATE POLICY "Members can view organization members" ON "OrganizationMember"
    FOR SELECT USING (public.is_org_member("organizationId"));

CREATE POLICY "Admins can add organization members" ON "OrganizationMember"
    FOR INSERT WITH CHECK (public.is_org_member("organizationId"));

-- Workspace Members: Members can view members of their workspace
CREATE POLICY "Members can view workspace members" ON "WorkspaceMember"
    FOR SELECT USING (public.is_workspace_member("workspaceId"));

CREATE POLICY "Admins can add workspace members" ON "WorkspaceMember"
    WITH CHECK (public.is_workspace_member("workspaceId") OR EXISTS (
        SELECT 1 FROM public."Workspace" w WHERE w.id = "WorkspaceMember"."workspaceId" AND public.is_org_member(w."organizationId")
    ));

-- Automated Trigger on auth.users for new user onboarding
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_profile_id TEXT;
    new_org_id TEXT;
    new_workspace_id TEXT;
    org_name TEXT;
    base_slug TEXT;
    final_slug TEXT;
    counter INT := 0;
BEGIN
    new_profile_id := gen_random_uuid()::text;
    new_org_id := gen_random_uuid()::text;
    new_workspace_id := gen_random_uuid()::text;

    org_name := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'organization_name'), ''),
        NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
        split_part(NEW.email, '@', 1)
    ) || '''s Org';

    base_slug := lower(regexp_replace(COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'organization_name'), ''), split_part(NEW.email, '@', 1)), '[^a-zA-Z0-9]', '-', 'g'));
    IF base_slug = '' THEN
        base_slug := 'org';
    END IF;
    final_slug := base_slug;
    WHILE EXISTS (SELECT 1 FROM public."Organization" WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;

    -- 1. Create Profile
    INSERT INTO public."Profile" (
        "id",
        "supabaseUserId",
        "email",
        "fullName",
        "timezone",
        "createdAt",
        "updatedAt"
    ) VALUES (
        new_profile_id,
        NEW.id::text,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'timezone', 'UTC'),
        NOW(),
        NOW()
    );

    -- 2. Create Organization
    INSERT INTO public."Organization" (
        "id",
        "name",
        "slug",
        "createdAt",
        "updatedAt"
    ) VALUES (
        new_org_id,
        org_name,
        final_slug,
        NOW(),
        NOW()
    );

    -- 3. Create OrganizationMember (Role: OWNER)
    INSERT INTO public."OrganizationMember" (
        "id",
        "organizationId",
        "profileId",
        "role",
        "createdAt",
        "updatedAt"
    ) VALUES (
        gen_random_uuid()::text,
        new_org_id,
        new_profile_id,
        'OWNER',
        NOW(),
        NOW()
    );

    -- 4. Create Default Workspace
    INSERT INTO public."Workspace" (
        "id",
        "organizationId",
        "name",
        "slug",
        "isDefault",
        "createdAt",
        "updatedAt"
    ) VALUES (
        new_workspace_id,
        new_org_id,
        'Main Workspace',
        'main',
        true,
        NOW(),
        NOW()
    );

    -- 5. Create WorkspaceMember (Role: ADMIN)
    INSERT INTO public."WorkspaceMember" (
        "id",
        "workspaceId",
        "profileId",
        "role",
        "createdAt",
        "updatedAt"
    ) VALUES (
        gen_random_uuid()::text,
        new_workspace_id,
        new_profile_id,
        'ADMIN',
        NOW(),
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
