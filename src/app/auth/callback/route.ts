import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/src/lib/supabase/server";

function getSafeNextPath(value: string | null): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return "/dashboard";
  }

  return value;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");

  const next = getSafeNextPath(
    requestUrl.searchParams.get("next"),
  );

  if (!code) {
    return NextResponse.redirect(
      new URL(
        `/forgot-password?error=${encodeURIComponent(
          "O link de recuperação é inválido ou expirou.",
        )}`,
        requestUrl.origin,
      ),
    );
  }

  const supabase =
    await createSupabaseServerClient();

  const { error } =
    await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/forgot-password?error=${encodeURIComponent(
          "Não foi possível validar o link. Solicite uma nova recuperação de senha.",
        )}`,
        requestUrl.origin,
      ),
    );
  }

  return NextResponse.redirect(
    new URL(next, requestUrl.origin),
  );
}