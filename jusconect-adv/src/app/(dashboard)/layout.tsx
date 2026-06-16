import type { ReactNode } from "react";
import { requireUserContext } from "@/src/lib/auth/get-user-context";
import { DashboardHeader } from "@/src/components/shared/DashboardHeader";
import { DashboardSidebar } from "@/src/components/shared/DashboardSidebar";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const context = await requireUserContext();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <DashboardSidebar role={context.role} />

        <div className="min-h-screen flex-1">
          <DashboardHeader context={context} />

          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}