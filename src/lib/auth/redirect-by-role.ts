import { redirect } from "next/navigation";

import type { UserRole } from "@/src/lib/auth/get-user-context";

export function redirectByRole(role: UserRole): never {
  if (role === "master") {
    redirect("/dashboard");
  }

  if (role === "lawyer") {
    redirect("/dashboard");
  }

  if (role === "client") {
    redirect("/dashboard/client");
  }

  redirect("/login");
}