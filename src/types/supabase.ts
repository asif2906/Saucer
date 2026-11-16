export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      Organization: {
        Row: {
          createdAt: string
          id: string
          logoUrl: string | null
          name: string
          slug: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          id: string
          logoUrl?: string | null
          name: string
          slug: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          id?: string
          logoUrl?: string | null
          name?: string
          slug?: string
          updatedAt?: string
        }
        Relationships: []
      }
      OrganizationMember: {
        Row: {
          createdAt: string
          id: string
          organizationId: string
          profileId: string
          role: Database["public"]["Enums"]["Role"]
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          id: string
          organizationId: string
          profileId: string
          role?: Database["public"]["Enums"]["Role"]
          updatedAt: string
        }
        Update: {
          createdAt?: string
          id?: string
          organizationId?: string
          profileId?: string
          role?: Database["public"]["Enums"]["Role"]
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "OrganizationMember_organizationId_fkey"
            columns: ["organizationId"]
            isOneToOne: false
            referencedRelation: "Organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "OrganizationMember_profileId_fkey"
            columns: ["profileId"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["id"]
          },
        ]
      }
      Profile: {
        Row: {
          avatarUrl: string | null
          createdAt: string
          email: string
          fullName: string | null
          id: string
          supabaseUserId: string
          timezone: string
          updatedAt: string
        }
        Insert: {
          avatarUrl?: string | null
          createdAt?: string
          email: string
          fullName?: string | null
          id: string
          supabaseUserId: string
          timezone?: string
          updatedAt: string
        }
        Update: {
          avatarUrl?: string | null
          createdAt?: string
          email?: string
          fullName?: string | null
          id?: string
          supabaseUserId?: string
          timezone?: string
          updatedAt?: string
        }
        Relationships: []
      }
      Workspace: {
        Row: {
          createdAt: string
          id: string
          isDefault: boolean
          name: string
          organizationId: string
          slug: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          id: string
          isDefault?: boolean
          name: string
          organizationId: string
          slug: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          id?: string
          isDefault?: boolean
          name?: string
          organizationId?: string
          slug?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Workspace_organizationId_fkey"
            columns: ["organizationId"]
            isOneToOne: false
            referencedRelation: "Organization"
            referencedColumns: ["id"]
          },
        ]
      }
      WorkspaceMember: {
        Row: {
          createdAt: string
          id: string
          profileId: string
          role: Database["public"]["Enums"]["WorkspaceRole"]
          updatedAt: string
          workspaceId: string
        }
        Insert: {
          createdAt?: string
          id: string
          profileId: string
          role?: Database["public"]["Enums"]["WorkspaceRole"]
          updatedAt: string
          workspaceId: string
        }
        Update: {
          createdAt?: string
          id?: string
          profileId?: string
          role?: Database["public"]["Enums"]["WorkspaceRole"]
          updatedAt?: string
          workspaceId?: string
        }
        Relationships: [
          {
            foreignKeyName: "WorkspaceMember_profileId_fkey"
            columns: ["profileId"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "WorkspaceMember_workspaceId_fkey"
            columns: ["workspaceId"]
            isOneToOne: false
            referencedRelation: "Workspace"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_profile_id: { Args: never; Returns: string }
      is_org_member: { Args: { org_id: string }; Returns: boolean }
      is_workspace_member: { Args: { ws_id: string }; Returns: boolean }
    }
    Enums: {
      Role: "OWNER" | "ADMIN" | "MEMBER"
      WorkspaceRole: "ADMIN" | "EDITOR" | "VIEWER"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
