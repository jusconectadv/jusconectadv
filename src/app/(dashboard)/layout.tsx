import type { ReactNode } from "react";

import { DashboardHeader } from "@/src/components/shared/DashboardHeader";
import { DashboardSidebar } from "@/src/components/shared/DashboardSidebar";
import { requireUserContext } from "@/src/lib/auth/get-user-context";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";

type DashboardLayoutProps = {
  children: ReactNode;
};

type MeetingCountResult = {
  count: number | null;
  error: {
    message: string;
  } | null;
};

async function getPendingMeetingCount(params: {
  role: "master" | "lawyer" | "client";
  tenantId: string | null;
}): Promise<number> {
  if (params.role !== "lawyer" || !params.tenantId) {
    return 0;
  }

  try {
    const admin = createSupabaseAdminClient();

    const result = (await admin
      .from("meetings" as never)
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("tenant_id", params.tenantId)
      .eq("status", "requested")) as unknown as MeetingCountResult;

    if (result.error) {
      console.error(
        "Erro ao contar solicitações de reunião:",
        result.error.message,
      );

      return 0;
    }

    return result.count ?? 0;
  } catch (error) {
    console.error("Erro ao carregar contador da agenda:", error);

    return 0;
  }
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const context = await requireUserContext();

  const pendingMeetingCount = await getPendingMeetingCount({
    role: context.role,
    tenantId: context.tenant?.id ?? null,
  });

  return (
    <div className="min-h-screen bg-[#F2EFEA]">
      <div className="flex min-h-screen">
        <DashboardSidebar
          role={context.role}
          pendingMeetingCount={pendingMeetingCount}
        />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <DashboardHeader context={context} />

          <main className="flex-1 px-4 py-5 md:px-6 md:py-6 xl:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}