import { redirect } from "next/navigation";
import type { UserRole } from "@/src/types/auth";

export function redirectByRole(role: UserRole): never {
  if (role === "master") {
    redirect("/dashboard/master");
  }

  if (role === "lawyer") {
    redirect("/dashboard/lawyer");
  }

  redirect("/dashboard/client");
}