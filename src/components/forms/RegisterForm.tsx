"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { registerAction } from "@/src/app/(auth)/actions";

type RegisterRole = "client" | "lawyer";

type PasswordFieldProps = {
  id: string;
  name: string;
  label: string;
  value: string;
  visible: boolean;
  placeholder: string;
  error?: string;
  customValidity?: string;
  onChange: (value: string) => void;
  onToggleVisibility: () => void;
};

function EyeIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3l18 18" />
        <path d="M10.6 10.6a2 2 0 002.8 2.8" />
        <path d="M9.9 4.2A10.8 10.8 0 0112 4c5.5 0 9.5 4.6 10 8a10.5 10.5 0 01-2.1 4.3" />
        <path d="M6.2 6.2C3.8 7.7 2.3 10 2 12c.5 3.4 4.5 8 10 8 1.6 0 3-.4 4.3-1" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PasswordField({
  id,
  name,
  label,
  value,
  visible,
  placeholder,
  error,
  customValidity,
  onChange,
  onToggleVisibility,
}: PasswordFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.setCustomValidity(customValidity ?? "");
  }, [customValidity]);

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-bold text-[#0B1D2D]"
      >
        {label}
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required
          minLength={6}
          value={value}
          autoComplete="new-password"
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => onChange(event.target.value)}
          className={`min-h-12 w-full rounded-2xl border bg-white px-4 py-3 pr-12 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:ring-4 focus:ring-[#C89B4A]/10 ${
            error
              ? "border-red-400 focus:border-red-500"
              : "border-[#D8D2C7] focus:border-[#C89B4A]"
          }`}
        />

        <button
          type="button"
          onClick={onToggleVisibility}
          aria-label={visible ? "Ocultar senha" : "Visualizar senha"}
          title={visible ? "Ocultar senha" : "Visualizar senha"}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-2xl text-[#5B6472] transition hover:bg-[#F8F6F1] hover:text-[#0B1D2D] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#C89B4A]"
        >
          <EyeIcon visible={visible} />
        </button>
      </div>

      {error ? (
        <p
          id={`${id}-error`}
          className="mt-2 text-xs font-semibold text-red-700"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function RegisterForm() {
  const [role, setRole] = useState<RegisterRole>("client");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const confirmationError = useMemo(() => {
    if (!confirmTouched) {
      return "";
    }

    if (!confirmPassword) {
      return "Confirme a senha escolhida.";
    }

    if (password !== confirmPassword) {
      return "A confirmação da senha não corresponde à senha informada.";
    }

    return "";
  }, [confirmPassword, confirmTouched, password]);

  return (
    <form action={registerAction} className="space-y-5">
      <div>
        <label
          htmlFor="fullName"
          className="mb-2 block text-sm font-bold text-[#0B1D2D]"
        >
          Nome completo *
        </label>

        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          autoComplete="name"
          placeholder="Digite seu nome completo"
          className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
        />
      </div>

      <div>
        <p className="mb-2 block text-sm font-bold text-[#0B1D2D]">
          Tipo de conta *
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
              role === "client"
                ? "border-[#C89B4A] bg-[#FFF8E8]"
                : "border-[#D8D2C7] bg-white hover:border-[#C89B4A]/60"
            }`}
          >
            <input
              type="radio"
              name="role"
              value="client"
              checked={role === "client"}
              onChange={() => setRole("client")}
              className="mt-1 h-4 w-4 accent-[#C89B4A]"
            />

            <span>
              <span className="block text-sm font-bold text-[#0B1D2D]">
                Cliente
              </span>

              <span className="mt-1 block text-xs leading-5 text-[#5B6472]">
                Para acompanhar casos, documentos, mensagens e reuniões.
              </span>
            </span>
          </label>

          <label
            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
              role === "lawyer"
                ? "border-[#C89B4A] bg-[#FFF8E8]"
                : "border-[#D8D2C7] bg-white hover:border-[#C89B4A]/60"
            }`}
          >
            <input
              type="radio"
              name="role"
              value="lawyer"
              checked={role === "lawyer"}
              onChange={() => setRole("lawyer")}
              className="mt-1 h-4 w-4 accent-[#C89B4A]"
            />

            <span>
              <span className="block text-sm font-bold text-[#0B1D2D]">
                Advogado
              </span>

              <span className="mt-1 block text-xs leading-5 text-[#5B6472]">
                Para criar e administrar um escritório na plataforma.
              </span>
            </span>
          </label>
        </div>
      </div>

      {role === "lawyer" ? (
        <div className="rounded-2xl border border-[#E7D7B5] bg-[#FFF8E8] p-4">
          <label
            htmlFor="tenantName"
            className="mb-2 block text-sm font-bold text-[#0B1D2D]"
          >
            Nome do escritório *
          </label>

          <input
            id="tenantName"
            name="tenantName"
            type="text"
            required
            autoComplete="organization"
            placeholder="Ex.: Vieira & Vasconcelos Advogados"
            className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
          />

          <p className="mt-2 text-xs leading-5 text-[#7A5B24]">
            Esse nome será exibido no painel e na página pública do
            escritório.
          </p>
        </div>
      ) : (
        <input type="hidden" name="tenantName" value="" />
      )}

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-bold text-[#0B1D2D]"
        >
          E-mail de acesso *
        </label>

        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="seu@email.com"
          className="min-h-12 w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm text-[#0B1D2D] outline-none transition placeholder:text-[#8FA0AE] focus:border-[#C89B4A] focus:ring-4 focus:ring-[#C89B4A]/10"
        />

        <p className="mt-2 text-xs leading-5 text-[#5B6472]">
          Este e-mail será utilizado para entrar no JUSCONECT ADV.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <PasswordField
          id="password"
          name="password"
          label="Senha *"
          value={password}
          visible={showPassword}
          placeholder="Mínimo de 6 caracteres"
          onChange={setPassword}
          onToggleVisibility={() =>
            setShowPassword((current) => !current)
          }
        />

        <PasswordField
          id="confirmPassword"
          name="confirmPassword"
          label="Confirmar senha *"
          value={confirmPassword}
          visible={showConfirmPassword}
          placeholder="Digite a senha novamente"
          error={confirmationError}
          customValidity={
            password !== confirmPassword
              ? "A confirmação da senha não corresponde à senha informada."
              : ""
          }
          onChange={(value) => {
            setConfirmPassword(value);
            setConfirmTouched(true);
          }}
          onToggleVisibility={() =>
            setShowConfirmPassword((current) => !current)
          }
        />
      </div>

      <div className="rounded-2xl border border-[#D8D2C7] bg-[#F8F6F1] p-4">
        <p className="text-xs leading-5 text-[#5B6472]">
          Sua senha deve possuir pelo menos 6 caracteres. Utilize uma
          combinação segura e não compartilhe seus dados de acesso.
        </p>
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-[#C89B4A] px-5 py-4 text-sm font-black text-[#0B1D2D] transition hover:bg-[#D9AE5F]"
      >
        Criar minha conta
      </button>
    </form>
  );
}