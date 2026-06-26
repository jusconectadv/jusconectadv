"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { getUserContext } from "@/src/lib/auth/get-user-context";
import { redirectByRole } from "@/src/lib/auth/redirect-by-role";

type RegisterRole = "master" | "lawyer" | "client";

function getStringField(
  formData: FormData,
  field: string,
): string {
  const value = formData.get(field);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function parseRole(value: string): RegisterRole {
  if (value === "lawyer") {
    return "lawyer";
  }

  if (value === "master") {
    return "master";
  }

  return "client";
}

async function getApplicationOrigin(): Promise<string> {
  const configuredSiteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredSiteUrl) {
    return configuredSiteUrl.replace(/\/+$/, "");
  }

  const requestHeaders = await headers();

  const forwardedHost =
    requestHeaders.get("x-forwarded-host");

  const host =
    forwardedHost ?? requestHeaders.get("host");

  const forwardedProtocol =
    requestHeaders.get("x-forwarded-proto");

  const protocol =
    forwardedProtocol ??
    (host?.includes("localhost") ? "http" : "https");

  if (!host) {
    throw new Error(
      "Não foi possível identificar a URL da aplicação.",
    );
  }

  return `${protocol}://${host}`;
}

export async function loginAction(
  formData: FormData,
): Promise<void> {
  const email = normalizeEmail(
    getStringField(formData, "email"),
  );

  const password = getStringField(
    formData,
    "password",
  );

  if (!email || !password) {
    redirect(
      `/login?error=${encodeURIComponent(
        "Informe e-mail e senha.",
      )}`,
    );
  }

  const supabase =
    await createSupabaseServerClient();

  const { error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    const message =
      error.message === "Invalid login credentials"
        ? "E-mail ou senha inválidos."
        : error.message;

    redirect(
      `/login?error=${encodeURIComponent(message)}`,
    );
  }

  const context = await getUserContext();

  if (!context) {
    redirect(
      `/login?error=${encodeURIComponent(
        "Perfil não encontrado.",
      )}`,
    );
  }

  redirectByRole(context.role);
}

export async function requestPasswordResetAction(
  formData: FormData,
): Promise<void> {
  const email = normalizeEmail(
    getStringField(formData, "email"),
  );

  if (!email) {
    redirect(
      `/forgot-password?error=${encodeURIComponent(
        "Informe o e-mail utilizado no cadastro.",
      )}`,
    );
  }

  const origin = await getApplicationOrigin();

  const supabase =
    await createSupabaseServerClient();

  const { error } =
    await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${origin}/auth/callback?next=/update-password`,
      },
    );

  if (error) {
    console.error(
      "Erro ao solicitar recuperação de senha:",
      error.message,
    );

    /*
     * Para não revelar se determinado e-mail existe ou não,
     * a resposta apresentada ao usuário continua genérica.
     */
  }

  redirect(
    `/forgot-password?success=${encodeURIComponent(
      "Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha. Verifique também a caixa de spam.",
    )}`,
  );
}

export async function updatePasswordAction(
  formData: FormData,
): Promise<void> {
  const password = getStringField(
    formData,
    "password",
  );

  const confirmPassword = getStringField(
    formData,
    "confirmPassword",
  );

  if (!password || !confirmPassword) {
    redirect(
      `/update-password?error=${encodeURIComponent(
        "Informe e confirme a nova senha.",
      )}`,
    );
  }

  if (password.length < 6) {
    redirect(
      `/update-password?error=${encodeURIComponent(
        "A nova senha deve possuir pelo menos 6 caracteres.",
      )}`,
    );
  }

  if (password !== confirmPassword) {
    redirect(
      `/update-password?error=${encodeURIComponent(
        "A confirmação não corresponde à nova senha.",
      )}`,
    );
  }

  const supabase =
    await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(
      `/forgot-password?error=${encodeURIComponent(
        "O link de recuperação é inválido ou expirou. Solicite um novo link.",
      )}`,
    );
  }

  const { error } =
    await supabase.auth.updateUser({
      password,
    });

  if (error) {
    redirect(
      `/update-password?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  await supabase.auth.signOut();

  revalidatePath("/", "layout");

  redirect(
    `/login?success=${encodeURIComponent(
      "Senha atualizada com sucesso. Entre utilizando sua nova senha.",
    )}`,
  );
}

export async function registerAction(
  formData: FormData,
): Promise<void> {
  const email = normalizeEmail(
    getStringField(formData, "email"),
  );

  const password = getStringField(
    formData,
    "password",
  );

  const fullName = getStringField(
    formData,
    "fullName",
  );

  const tenantName = getStringField(
    formData,
    "tenantName",
  );

  const role = parseRole(
    getStringField(formData, "role"),
  );

  if (!email || !password || !fullName) {
    redirect(
      `/register?error=${encodeURIComponent(
        "Informe nome, e-mail e senha.",
      )}`,
    );
  }

  if (password.length < 6) {
    redirect(
      `/register?error=${encodeURIComponent(
        "A senha deve possuir pelo menos 6 caracteres.",
      )}`,
    );
  }

  if (role === "lawyer" && !tenantName) {
    redirect(
      `/register?error=${encodeURIComponent(
        "Informe o nome do escritório.",
      )}`,
    );
  }

  const supabase =
    await createSupabaseServerClient();

  const admin =
    createSupabaseAdminClient();

  const { data, error } =
    await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

  if (error) {
    const normalizedMessage =
      error.message.toLowerCase();

    const isExistingAccount =
      normalizedMessage.includes("already") ||
      normalizedMessage.includes("registered") ||
      normalizedMessage.includes("exists");

    const message = isExistingAccount
      ? "Este e-mail já possui uma conta. Entre com sua senha."
      : error.message;

    redirect(
      `/register?error=${encodeURIComponent(
        message,
      )}`,
    );
  }

  const userId = data.user?.id;

  if (!userId) {
    redirect(
      `/login?success=${encodeURIComponent(
        "Conta criada. Confirme seu e-mail para continuar.",
      )}`,
    );
  }

  const { error: profileError } =
    await admin.from("profiles").upsert(
      {
        id: userId,
        full_name: fullName,
        role,
      },
      {
        onConflict: "id",
      },
    );

  if (profileError) {
    redirect(
      `/register?error=${encodeURIComponent(
        profileError.message,
      )}`,
    );
  }

  if (role === "lawyer") {
    const {
      data: tenant,
      error: tenantError,
    } = await admin
      .from("tenants")
      .insert({
        owner_id: userId,
        name: tenantName,
        plan: "basic",
        active: true,
      })
      .select("*")
      .single();

    if (tenantError || !tenant) {
      redirect(
        `/register?error=${encodeURIComponent(
          tenantError?.message ??
            "Erro ao criar escritório.",
        )}`,
      );
    }

    const { error: memberError } =
      await admin
        .from("tenant_members")
        .insert({
          tenant_id: tenant.id,
          user_id: userId,
          role: "owner",
          is_active: true,
        });

    if (memberError) {
      redirect(
        `/register?error=${encodeURIComponent(
          memberError.message,
        )}`,
      );
    }
  }

  /*
   * Para clientes, o vínculo com cada escritório é criado pelo
   * formulário público daquele tenant:
   *
   * /advogado/[tenantId]
   *
   * Uma mesma conta pode possuir vínculos com vários escritórios.
   */

  redirect(
    `/login?success=${encodeURIComponent(
      "Conta criada com sucesso. Faça login.",
    )}`,
  );
}

export async function logoutAction(): Promise<void> {
  const supabase =
    await createSupabaseServerClient();

  await supabase.auth.signOut();

  redirect("/login");
}