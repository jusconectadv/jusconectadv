import type { ReactNode } from "react";

import { DashboardHeader } from "@/src/components/shared/DashboardHeader";
import { DashboardSidebar } from "@/src/components/shared/DashboardSidebar";
import { requireUserContext } from "@/src/lib/auth/get-user-context";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const context = await requireUserContext();

  return (
    <div className="min-h-screen bg-[#F2EFEA]">
      <div className="flex min-h-screen">
        <DashboardSidebar role={context.role} />

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