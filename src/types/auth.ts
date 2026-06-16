import type { Database } from "@/src/types/supabase";

export type UserRole = Database["public"]["Enums"]["user_role"];

export type TenantMemberRole =
  Database["public"]["Enums"]["tenant_member_role"];

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type TenantRow = Database["public"]["Tables"]["tenants"]["Row"];

export type TenantMemberRow =
  Database["public"]["Tables"]["tenant_members"]["Row"];

export type UserContext = {
  user: {
    id: string;
    email: string | null;
  };
  profile: ProfileRow;
  role: UserRole;
  tenant: TenantRow | null;
  tenantMember: TenantMemberRow | null;
};