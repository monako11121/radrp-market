"use client";

import { useActionState } from "react";
import { changePassword }  from "@/app/actions/user";

const inputStyle = {
  width: "100%",
  height: 56,
  background: "#0d1219",
  border: "1px solid #1d2734",
  borderRadius: 16,
  padding: "0 18px",
  color: "white",
  outline: "none",
  fontSize: 15,
} as const;

const labelStyle = {
  marginBottom: 10,
  fontSize: 14,
  color: "#7e8796",
} as const;

export default function PasswordForm() {
  const [state, formAction, isPending] = useActionState(changePassword, null);

  return (
    <div className="card" style={{ padding: 32 }}>

      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Безопасность</h2>
      <p style={{ fontSize: 14, color: "#7e8796", marginBottom: 28 }}>
        Смена пароля от аккаунта.
      </p>

      <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        <div>
          <div style={labelStyle}>Текущий пароль</div>
          <input
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            style={inputStyle}
          />
        </div>

        <div>
          <div style={labelStyle}>Новый пароль</div>
          <input
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            style={inputStyle}
          />
        </div>

        <div>
          <div style={labelStyle}>Подтверждение нового пароля</div>
          <input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            style={inputStyle}
          />
        </div>

        {state?.error && (
          <div style={{
            padding: "12px 16px", borderRadius: 14,
            background: "rgba(239,68,68,.12)", border: "1px solid rgba(239,68,68,.22)",
            color: "#ef4444", fontSize: 14,
          }}>
            {state.error}
          </div>
        )}

        {state?.success && (
          <div style={{
            padding: "12px 16px", borderRadius: 14,
            background: "rgba(34,197,94,.10)", border: "1px solid rgba(34,197,94,.20)",
            color: "#22c55e", fontSize: 14,
          }}>
            {state.success}
          </div>
        )}

        <div style={{ paddingTop: 6 }}>
          <button
            type="submit"
            className="orangeButton"
            disabled={isPending}
            style={{ height: 58, padding: "0 32px", opacity: isPending ? 0.6 : 1 }}
          >
            {isPending ? "Сохранение..." : "Изменить пароль"}
          </button>
        </div>

      </form>
    </div>
  );
}
