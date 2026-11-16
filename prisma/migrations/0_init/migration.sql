-- Saucer Phase 1 Supabase PostgreSQL Initial Migration
-- Creates Profile, Organization, OrganizationMember, Workspace, WorkspaceMember
-- Includes Row Level Security (RLS) policies

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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- Create Organization Table
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- Create OrganizationMember Table
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- Create WorkspaceMember Table
CREATE TABLE "WorkspaceMember" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "role" "WorkspaceRole" NOT NULL DEFAULT 'EDITOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

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

-- Row Level Security (RLS) Enablement
ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Organization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrganizationMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Workspace" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkspaceMember" ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view and edit their own profile
CREATE POLICY "Users can view own profile" ON "Profile"
    FOR SELECT USING (auth.uid()::text = "supabaseUserId");

CREATE POLICY "Users can update own profile" ON "Profile"
    FOR UPDATE USING (auth.uid()::text = "supabaseUserId");

-- Organizations: Members can view their organizations
CREATE POLICY "Members can view organization" ON "Organization"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "OrganizationMember" om
            JOIN "Profile" p ON om."profileId" = p."id"
            WHERE om."organizationId" = "Organization"."id"
            AND p."supabaseUserId" = auth.uid()::text
        )
    );

-- Workspaces: Members can view their workspaces
CREATE POLICY "Members can view workspace" ON "Workspace"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "WorkspaceMember" wm
            JOIN "Profile" p ON wm."profileId" = p."id"
            WHERE wm."workspaceId" = "Workspace"."id"
            AND p."supabaseUserId" = auth.uid()::text
        )
    );

