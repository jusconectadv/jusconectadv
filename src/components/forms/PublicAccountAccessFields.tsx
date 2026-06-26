"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type AccountMode = "create" | "login";

type PasswordFieldProps = {
  label: string;
  name: string;
  value: string;
  visible: boolean;
  placeholder: string;
  autoComplete: string;
  required?: boolean;
  error?: string;
  customValidity?: string;
  onChange: (value: string) => void;
  onToggleVisibility: () => void;
};

function EyeIcon({ hidden }: { hidden: boolean }) {
  return hidden ? (
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
  ) : (
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
  label,
  name,
  value,
  visible,
  placeholder,
  autoComplete,
  required,
  error,
  customValidity,
  onChange,
  onToggleVisibility,
}: PasswordFieldProps) {
  const describedBy = error ? `${name}-error` : undefined;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.setCustomValidity(customValidity ?? "");
  }, [customValidity]);

  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-bold text-[#0B1D2D]"
      >
        {label}
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          required={required}
          minLength={6}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
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
          <EyeIcon hidden={visible} />
        </button>
      </div>

      {error ? (
        <p
          id={`${name}-error`}
          className="mt-2 text-xs font-semibold text-red-700"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function PublicAccountAccessFields() {
  const [accountMode, setAccountMode] = useState<AccountMode>("create");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  const confirmationError = useMemo(() => {
    if (accountMode !== "create" || !confirmTouched) {
      return "";
    }

    if (!confirmPassword) {
      return "Confirme a senha para criar sua conta.";
    }

    if (password !== confirmPassword) {
      return "A confirmação da senha não corresponde à senha informada.";
    }

    return "";
  }, [accountMode, confirmPassword, confirmTouched, password]);

  return (
    <>
      <div className="rounded-2xl border border-[#D8D2C7] bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C89B4A]">
          Senha de acesso
        </p>

        <h3 className="mt-2 text-lg font-bold text-[#0B1D2D]">
          Escolha como deseja acessar sua conta
        </h3>

        <p className="mt-2 text-sm leading-6 text-[#5B6472]">
          O e-mail informado acima e a senha digitada abaixo serão usados para
          acessar o painel do cliente.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#E7D7B5] bg-[#FFF8E8] p-4">
            <input
              type="radio"
              name="accountMode"
              value="create"
              checked={accountMode === "create"}
              onChange={() => {
                setAccountMode("create");
                setConfirmTouched(false);
              }}
              className="mt-1 h-4 w-4 accent-[#C89B4A]"
            />

            <span>
              <span className="block text-sm font-bold text-[#0B1D2D]">
                Criar minha conta
              </span>

              <span className="mt-1 block text-xs leading-5 text-[#7A5B24]">
                Escolha esta opção caso ainda não tenha acesso ao JUSCONECT ADV.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#D8D2C7] bg-[#F8F6F1] p-4">
            <input
              type="radio"
              name="accountMode"
              value="login"
              checked={accountMode === "login"}
              onChange={() => {
                setAccountMode("login");
                setConfirmTouched(false);
              }}
              className="mt-1 h-4 w-4 accent-[#C89B4A]"
            />

            <span>
              <span className="block text-sm font-bold text-[#0B1D2D]">
                Já tenho uma conta
              </span>

              <span className="mt-1 block text-xs leading-5 text-[#5B6472]">
                Use o mesmo e-mail e senha, mesmo que sua conta tenha sido
                criada em outro escritório.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <PasswordField
          label="Senha de acesso *"
          name="password"
          value={password}
          visible={showPassword}
          placeholder="Mínimo de 6 caracteres"
          autoComplete={
            accountMode === "create" ? "new-password" : "current-password"
          }
          required
          onChange={setPassword}
          onToggleVisibility={() =>
            setShowPassword((current) => !current)
          }
        />

        <div>
          <PasswordField
            label={
              accountMode === "create"
                ? "Confirmar senha *"
                : "Confirmar senha"
            }
            name="confirmPassword"
            value={confirmPassword}
            visible={showConfirmPassword}
            placeholder="Repita a senha ao criar uma conta"
            autoComplete="new-password"
            required={accountMode === "create"}
            error={confirmationError}
            customValidity={
              accountMode === "create" &&
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

          <p className="mt-2 text-xs leading-5 text-[#5B6472]">
            {accountMode === "login"
              ? "Para quem já possui conta, este campo pode ficar vazio."
              : "Digite novamente a mesma senha para confirmar a criação da conta."}
          </p>
        </div>
      </div>
    </>
  );
}