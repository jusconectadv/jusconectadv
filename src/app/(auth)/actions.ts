"use server";

import { redirect } from "next/navigation";

import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { getUserContext } from "@/src/lib/auth/get-user-context";
import { redirectByRole } from "@/src/lib/auth/redirect-by-role";

type RegisterRole = "master" | "lawyer" | "client";

function getStringField(formData: FormData, field: string): string {
  const value = formData.get(field);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
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

export async function loginAction(formData: FormData): Promise<void> {
  const email = getStringField(formData, "email");
  const password = getStringField(formData, "password");

  if (!email || !password) {
    redirect("/login?error=Informe email e senha.");
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  const context = await getUserContext();

  if (!context) {
    redirect("/login?error=Perfil não encontrado.");
  }

  redirectByRole(context.role);
}

export async function registerAction(formData: FormData): Promise<void> {
  const email = getStringField(formData, "email");
  const password = getStringField(formData, "password");
  const fullName = getStringField(formData, "fullName");
  const tenantName = getStringField(formData, "tenantName");
  const role = parseRole(getStringField(formData, "role"));

  if (!email || !password || !fullName) {
    redirect("/register?error=Informe nome, email e senha.");
  }

  if (role === "lawyer" && !tenantName) {
    redirect("/register?error=Informe o nome do escritório.");
  }

  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`);
  }

  const userId = data.user?.id;

  if (!userId) {
    redirect("/login?success=Conta criada. Confirme seu email para continuar.");
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: userId,
    full_name: fullName,
    role,
  });

  if (profileError) {
    redirect(`/register?error=${encodeURIComponent(profileError.message)}`);
  }

  if (role === "lawyer") {
    const { data: tenant, error: tenantError } = await admin
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
          tenantError?.message ?? "Erro ao criar escritório.",
        )}`,
      );
    }

    const { error: memberError } = await admin.from("tenant_members").insert({
      tenant_id: tenant.id,
      user_id: userId,
      role: "owner",
      is_active: true,
    });

    if (memberError) {
      redirect(`/register?error=${encodeURIComponent(memberError.message)}`);
    }
  }

  if (role === "client") {
    const { error: linkClientError } = await admin
      .from("clients")
      .update({
        auth_user_id: userId,
      })
      .ilike("email", email)
      .is("auth_user_id", null);

    if (linkClientError) {
      redirect(
        `/register?error=${encodeURIComponent(linkClientError.message)}`,
      );
    }
  }

  redirect("/login?success=Conta criada com sucesso. Faça login.");
}

export async function logoutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();

  redirect("/login");
}