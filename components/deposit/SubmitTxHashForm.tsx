"use client";

import { useActionState } from "react";
import { submitDepositTxHash } from "@/app/actions/payments";

export default function SubmitTxHashForm({ depositId }: { depositId: string }) {
  const [state, formAction, isPending] = useActionState(submitDepositTxHash, null);

  if (state?.success) {
    return (
      <div style={{
        padding: "14px 18px",
        borderRadius: 12,
        background: "rgba(34,197,94,.08)",
        border: "1px solid rgba(34,197,94,.2)",
        color: "#22c55e",
        fontWeight: 600,
        fontSize: 14,
      }}>
        ✓ {state.success}
      </div>
    );
  }

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <input type="hidden" name="depositId" value={depositId} />

      <div>
        <div style={{ fontSize: 13, color: "#7e8796", marginBottom: 8 }}>
          TX Hash транзакции (USDT TRC20)
        </div>
        <input
          name="txHash"
          placeholder="Например: 9f3c2a1b..."
          required
          style={{
            width: "100%",
            height: 52,
            background: "#0d1219",
            border: "1px solid #1d2734",
            borderRadius: 14,
            padding: "0 16px",
            color: "white",
            outline: "none",
            fontSize: 14,
            fontFamily: "monospace",
            boxSizing: "border-box",
          }}
        />
        <div style={{ fontSize: 12, color: "#7e8796", marginTop: 6 }}>
          Без указания хэша транзакции администратор не сможет подтвердить заявку.
        </div>
      </div>

      {state?.error && (
        <div style={{
          padding: "12px 16px",
          borderRadius: 12,
          background: "rgba(239,68,68,.12)",
          border: "1px solid rgba(239,68,68,.22)",
          color: "#ef4444",
          fontSize: 14,
        }}>
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="orangeButton"
        style={{ height: 50, fontSize: 15, opacity: isPending ? 0.6 : 1 }}
      >
        {isPending ? "Сохранение..." : "Сохранить TX Hash"}
      </button>
    </form>
  );
}
