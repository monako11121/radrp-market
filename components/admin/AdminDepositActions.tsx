"use client";

import { useActionState } from "react";
import { adminApproveCryptoDeposit, adminRejectCryptoDeposit } from "@/app/actions/payments";

interface Props {
  depositId: string;
  amount: number;
}

export default function AdminDepositActions({ depositId, amount }: Props) {
  const [approveState, approveAction, approvePending] = useActionState(adminApproveCryptoDeposit, null);
  const [rejectState,  rejectAction,  rejectPending]  = useActionState(adminRejectCryptoDeposit, null);

  const done = approveState?.success || rejectState?.success;

  if (done) {
    const isApproved = !!approveState?.success;
    return (
      <div style={{
        padding: "14px 18px",
        borderRadius: 12,
        background: isApproved ? "rgba(34,197,94,.08)" : "rgba(239,68,68,.08)",
        border: `1px solid ${isApproved ? "rgba(34,197,94,.2)" : "rgba(239,68,68,.2)"}`,
        color: isApproved ? "#22c55e" : "#ef4444",
        fontWeight: 600,
        fontSize: 14,
      }}>
        {isApproved ? approveState.success : rejectState!.success}
      </div>
    );
  }

  const error = approveState?.error || rejectState?.error;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      {error && (
        <div style={{
          padding: "12px 16px",
          borderRadius: 10,
          background: "rgba(239,68,68,.1)",
          border: "1px solid rgba(239,68,68,.2)",
          color: "#ef4444",
          fontSize: 14,
        }}>
          {error}
        </div>
      )}

      <form action={approveAction} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
        <input type="hidden" name="depositId" value={depositId} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 12, color: "#7e8796", marginBottom: 4 }}>TX Hash (необязательно)</div>
          <input
            name="txHash"
            placeholder="TRC20 hash..."
            style={{
              width: "100%",
              height: 40,
              background: "#0d1219",
              border: "1px solid #1d2734",
              borderRadius: 10,
              padding: "0 12px",
              color: "white",
              fontSize: 13,
              fontFamily: "monospace",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 12, color: "#7e8796", marginBottom: 4 }}>Заметка (необязательно)</div>
          <input
            name="adminNote"
            placeholder="Комментарий..."
            style={{
              width: "100%",
              height: 40,
              background: "#0d1219",
              border: "1px solid #1d2734",
              borderRadius: 10,
              padding: "0 12px",
              color: "white",
              fontSize: 13,
              boxSizing: "border-box",
            }}
          />
        </div>
        <button
          type="submit"
          disabled={approvePending || rejectPending}
          style={{
            height: 40,
            padding: "0 20px",
            borderRadius: 10,
            background: "#22c55e",
            color: "black",
            fontWeight: 800,
            fontSize: 14,
            border: "none",
            cursor: approvePending ? "wait" : "pointer",
            opacity: approvePending ? 0.7 : 1,
            whiteSpace: "nowrap",
          }}
        >
          {approvePending ? "..." : `✓ Подтвердить $${amount.toFixed(2)}`}
        </button>
      </form>

      <form action={rejectAction} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
        <input type="hidden" name="depositId" value={depositId} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 12, color: "#7e8796", marginBottom: 4 }}>Причина отклонения</div>
          <input
            name="adminNote"
            defaultValue="Транзакция не найдена"
            style={{
              width: "100%",
              height: 40,
              background: "#0d1219",
              border: "1px solid #1d2734",
              borderRadius: 10,
              padding: "0 12px",
              color: "white",
              fontSize: 13,
              boxSizing: "border-box",
            }}
          />
        </div>
        <button
          type="submit"
          disabled={approvePending || rejectPending}
          style={{
            height: 40,
            padding: "0 20px",
            borderRadius: 10,
            background: "rgba(239,68,68,.15)",
            color: "#ef4444",
            fontWeight: 700,
            fontSize: 14,
            border: "1px solid rgba(239,68,68,.3)",
            cursor: rejectPending ? "wait" : "pointer",
            opacity: rejectPending ? 0.7 : 1,
            whiteSpace: "nowrap",
          }}
        >
          {rejectPending ? "..." : "✗ Отклонить"}
        </button>
      </form>

    </div>
  );
}
