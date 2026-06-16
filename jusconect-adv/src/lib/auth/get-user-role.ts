import type { UserRole } from "@/src/types/auth";
import { getUserContext } from "@/src/lib/auth/get-user-context";

export async function getUserRole(): Promise<UserRole | null> {
  const context = await getUserContext();

  return context?.role ?? null;
}