import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import type { UserContext } from "@/src/types/auth";

export async function getUserContext(): Promise<UserContext | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return null;
  }

  const { data: tenantMember } = await supabase
    .from("tenant_members")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  const tenant = tenantMember
    ? await supabase
        .from("tenants")
        .select("*")
        .eq("id", tenantMember.tenant_id)
        .maybeSingle()
    : null;

  return {
    user: {
      id: user.id,
      email: user.email ?? null,
    },
    profile,
    role: profile.role,
    tenant: tenant?.data ?? null,
    tenantMember: tenantMember ?? null,
  };
}

export async function requireUserContext(): Promise<UserContext> {
  const context = await getUserContext();

  if (!context) {
    redirect("/login");
  }

  return context;
}