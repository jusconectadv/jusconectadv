"use server";

import { redirect } from "next/navigation";

import { requireUserContext } from "@/src/lib/auth/get-user-context";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import type { Database } from "@/src/types/supabase";

type TenantRow = Database["public"]["Tables"]["tenants"]["Row"];

export type LawyerSettingsResult = {
  tenant: TenantRow;
  public_intake_path: string;
};

function isAllowedProfileRole(role: string): boolean {
  return role === "lawyer" || role === "master";
}

export async function getLawyerSettings(): Promise<LawyerSettingsResult> {
  const context = await requireUserContext();

  if (!isAllowedProfileRole(context.role)) {
    redirect("/dashboard");
  }

  if (!context.tenant) {
    redirect("/dashboard");
  }

  const supabase = await createSupabaseServerClient();

  const { data: tenant, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", context.tenant.id)
    .single();

  if (error || !tenant) {
    redirect("/dashboard");
  }

  return {
    tenant,
    public_intake_path: `/advogado/${tenant.id}`,
  };
}