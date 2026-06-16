"use server";

import { redirect } from "next/navigation";

import { requireUserContext } from "@/src/lib/auth/get-user-context";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import type { Json, Database } from "@/src/types/supabase";

type ActionLogRow = Database["public"]["Tables"]["action_logs"]["Row"];

export type AuditLogItem = ActionLogRow & {
  actor_name: string | null;
  actor_email: string | null;
};

export type AuditLogsResult = {
  logs: AuditLogItem[];
};

type CreateAuditLogParams = {
  tenantId: string;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  description: string;
  metadata?: Json;
};

function isAllowedProfileRole(role: string): boolean {
  return role === "lawyer" || role === "master";
}

function isAllowedTenantMemberRole(role: string): boolean {
  return role === "owner" || role === "staff";
}

export async function createAuditLog({
  tenantId,
  actorId,
  action,
  entityType,
  entityId,
  description,
  metadata = {},
}: CreateAuditLogParams): Promise<void> {
  const admin = createSupabaseAdminClient();

  const { error } = await admin.from("action_logs").insert({
    tenant_id: tenantId,
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    description,
    metadata,
  });

  if (error) {
    console.error("Erro ao criar log de auditoria:", error.message);
  }
}

async function getAuthorizedAuditContext(): Promise<{
  tenantId: string;
}> {
  const context = await requireUserContext();

  if (context.role === "client") {
    redirect("/dashboard/client");
  }

  if (!isAllowedProfileRole(context.role)) {
    redirect("/dashboard");
  }

  if (!context.tenant) {
    redirect("/dashboard");
  }

  const admin = createSupabaseAdminClient();

  const { data: membership, error: membershipError } = await admin
    .from("tenant_members")
    .select("role, is_active")
    .eq("tenant_id", context.tenant.id)
    .eq("user_id", context.user.id)
    .eq("is_active", true)
    .single();

  if (
    membershipError ||
    !membership ||
    !isAllowedTenantMemberRole(membership.role)
  ) {
    redirect("/dashboard");
  }

  return {
    tenantId: context.tenant.id,
  };
}

export async function listAuditLogs(): Promise<AuditLogsResult> {
  const { tenantId } = await getAuthorizedAuditContext();
  const admin = createSupabaseAdminClient();

  const { data: logs, error } = await admin
    .from("action_logs")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  const safeLogs = logs ?? [];
  const actorIds = Array.from(
    new Set(
      safeLogs
        .map((log) => log.actor_id)
        .filter((actorId): actorId is string => Boolean(actorId)),
    ),
  );

  if (actorIds.length === 0) {
    return {
      logs: safeLogs.map((log) => ({
        ...log,
        actor_name: null,
        actor_email: null,
      })),
    };
  }

  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("id, full_name, email")
    .in("id", actorIds);

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  const profilesById = new Map<
    string,
    {
      full_name: string | null;
      email: string | null;
    }
  >();

  (profiles ?? []).forEach((profile) => {
    profilesById.set(profile.id, {
      full_name: profile.full_name,
      email: profile.email,
    });
  });

  return {
    logs: safeLogs.map((log) => {
      const actor = log.actor_id ? profilesById.get(log.actor_id) : null;

      return {
        ...log,
        actor_name: actor?.full_name ?? null,
        actor_email: actor?.email ?? null,
      };
    }),
  };
}