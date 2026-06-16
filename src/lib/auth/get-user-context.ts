import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import type { Database } from "@/src/types/supabase";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type TenantRow = Database["public"]["Tables"]["tenants"]["Row"];
type TenantMemberRow = Database["public"]["Tables"]["tenant_members"]["Row"];

export type UserRole = "master" | "lawyer" | "client";

export type TenantMemberRole = "owner" | "staff" | "client";

export type UserContextProfile = Omit<ProfileRow, "role"> & {
  role: UserRole;
};

export type UserContextTenantMember = Omit<TenantMemberRow, "role"> & {
  role: TenantMemberRole;
};

export type UserContext = {
  user: {
    id: string;
    email: string | null;
  };
  profile: UserContextProfile;
  role: UserRole;
  tenant: TenantRow | null;
  tenantMember: UserContextTenantMember | null;
};

function normalizeUserRole(value: unknown): UserRole {
  if (value === "master" || value === "lawyer" || value === "client") {
    return value;
  }

  return "client";
}

function normalizeTenantMemberRole(value: unknown): TenantMemberRole {
  if (value === "owner" || value === "staff" || value === "client") {
    return value;
  }

  return "client";
}

export async function requireUserContext(): Promise<UserContext> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    redirect("/login");
  }

  const role = normalizeUserRole(profile.role);

  const { data: tenantMemberRaw, error: tenantMemberError } = await supabase
    .from("tenant_members")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (tenantMemberError) {
    throw new Error(tenantMemberError.message);
  }

  const tenantMember: UserContextTenantMember | null = tenantMemberRaw
    ? {
        ...tenantMemberRaw,
        role: normalizeTenantMemberRole(tenantMemberRaw.role),
      }
    : null;

  const tenantId = tenantMember?.tenant_id ?? null;

  const tenant = tenantId
    ? await supabase
        .from("tenants")
        .select("*")
        .eq("id", tenantId)
        .maybeSingle()
    : null;

  if (tenant?.error) {
    throw new Error(tenant.error.message);
  }

  return {
    user: {
      id: user.id,
      email: user.email ?? null,
    },
    profile: {
      ...profile,
      role,
    },
    role,
    tenant: tenant?.data ?? null,
    tenantMember,
  };
}